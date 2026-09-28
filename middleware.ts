import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import type { SessionData } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/session";

// ─── Scudo anti-bot sulle Server Actions ──────────────────────────────────────
// Dal 2026-08-30 un bot invia POST verso le Server Actions (form contatti) ogni
// ~5s, 24/7: ogni tentativo falliva DENTRO Next.js ("Missing `origin` header
// from a forwarded Server Actions request") dopo aver già generato ~12KB di
// risposta → ~8,5MB/ora → 5GB/mese di banda Render esauriti e servizio sospeso.
// Un browser reale invia SEMPRE `Origin` su un POST di Server Action: se manca
// o punta altrove, la richiesta non è legittima e la chiudiamo qui, a costo zero.
function isForgedServerAction(request: NextRequest): boolean {
  if (request.method !== "POST") return false;
  if (!request.headers.get("next-action")) return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  const expected = new Set<string>();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) expected.add(host.toLowerCase());
  expected.add(request.nextUrl.host.toLowerCase());
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site) expected.add(new URL(site).host.toLowerCase());
  } catch {
    // NEXT_PUBLIC_SITE_URL malformata: si ignora, restano gli host della richiesta.
  }

  try {
    return !expected.has(new URL(origin).host.toLowerCase());
  } catch {
    return true; // Origin non è nemmeno una URL valida.
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prima di tutto il resto: risposta vuota (~0 byte) ai POST contraffatti.
  if (isForgedServerAction(request)) {
    return new NextResponse(null, { status: 403 });
  }

  // Oltre allo scudo, il middleware si occupa SOLO dell'area admin.
  if (!pathname.startsWith("/admina")) {
    return NextResponse.next();
  }

  // DEV-ONLY: when DEV_UA_SWITCH=true the U/A DevSwitcher must move freely
  // between user and admin views WITHOUT any login. This bypass is gated by the
  // flag (absent in production) and must never be coupled to auth/security logic.
  if (process.env.DEV_UA_SWITCH === "true") {
    return NextResponse.next();
  }

  // Let the login page through — everything else under /admina requires auth
  if (pathname === "/admina/login") {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

  if (cookieValue) {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) {
      try {
        const data = await unsealData<SessionData>(cookieValue, {
          password: secret,
        });
        if (data.loggedIn) {
          return NextResponse.next();
        }
      } catch {
        // Corrupted / tampered cookie — fall through to redirect
      }
    }
  }

  const loginUrl = new URL("/admina/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Ogni pagina/azione tranne gli asset statici: lo scudo deve vedere i POST
  // verso le Server Actions pubbliche (form contatti), non solo /admina.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|manifest.webmanifest).*)"],
};
