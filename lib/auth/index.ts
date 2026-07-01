import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";
import bcrypt from "bcryptjs";
import {
  SESSION_COOKIE,
  SessionData,
  getSessionSecret,
  sessionCookieOptions,
} from "./session";

// ─── Read session ─────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
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

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
  remember = true
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase())
    return false;

  // Support plain text passwords (dev) and bcrypt hashes (prod)
  const passwordOk = adminPassword.startsWith("$2")
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;

  if (!passwordOk) return false;

  const data: SessionData = { email: adminEmail, loggedIn: true };
  const sealed = await sealData(data, {
    password: getSessionSecret(),
    ttl: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8, // 30d or 8h
  });

  cookies().set(SESSION_COOKIE, sealed, sessionCookieOptions(remember));
  return true;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}
