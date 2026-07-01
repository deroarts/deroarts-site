import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import type { SessionData } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/admina/:path*"],
};
