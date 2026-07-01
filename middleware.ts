import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import type { SessionData } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the login page through — everything else under /admin requires auth
  if (pathname === "/admin/login") {
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

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
