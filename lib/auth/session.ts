// Session helpers — use sealData/unsealData from iron-session directly
// so the same code works in both Node.js (server actions) and Edge (middleware).

import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_COOKIE = "deroarts_admin";

export interface SessionData {
  email: string;
  loggedIn: boolean;
}

export function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET env var must be at least 32 characters");
  }
  return s;
}

/** Cookie options for the session. */
export function sessionCookieOptions(remember: boolean = true) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined, // 30 days or session-only
  };
}
