import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";
import bcrypt from "bcryptjs";
import type { AuthAdapter } from "./adapter";
import {
  SESSION_COOKIE,
  SessionData,
  getSessionSecret,
  sessionCookieOptions,
} from "./session";

/**
 * CookieAuthAdapter — stores the session as an iron-session sealed cookie.
 * Credentials are read from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * ADMIN_PASSWORD may be a bcrypt hash (recommended for production) or, only
 * when NODE_ENV !== "production", a plain-text value.
 */
export class CookieAuthAdapter implements AuthAdapter {
  async login(email: string, password: string, remember = true): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) return false;
    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;

    let passwordOk: boolean;
    if (adminPassword.startsWith("$2")) {
      // bcrypt hash (production-safe)
      passwordOk = await bcrypt.compare(password, adminPassword);
    } else {
      // Plain text — only allowed outside production
      if (process.env.NODE_ENV === "production") return false;
      passwordOk = password === adminPassword;
    }

    if (!passwordOk) return false;

    const data: SessionData = { email: adminEmail, loggedIn: true };
    const sealed = await sealData(data, {
      password: getSessionSecret(),
      ttl: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8, // 30d / 8h
    });

    cookies().set(SESSION_COOKIE, sealed, sessionCookieOptions(remember));
    return true;
  }

  async logout(): Promise<void> {
    cookies().delete(SESSION_COOKIE);
  }

  async getSession(): Promise<SessionData | null> {
    const value = cookies().get(SESSION_COOKIE)?.value;
    if (!value) return null;
    try {
      const data = await unsealData<SessionData>(value, {
        password: getSessionSecret(),
      });
      return data.loggedIn ? data : null;
    } catch {
      return null;
    }
  }
}
