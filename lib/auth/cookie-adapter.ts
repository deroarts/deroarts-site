import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import type { AuthAdapter } from "./adapter";
import {
  SESSION_COOKIE,
  SessionData,
  getSessionSecret,
  sessionCookieOptions,
  SESSION_TTL_SECONDS,
} from "./session";

/** Chiave stabile della riga single-row delle credenziali admin. */
export const ADMIN_CRED_KEY = "admin";

/**
 * CookieAuthAdapter — sessione come cookie iron-session sigillato.
 * Le credenziali (nickname + PIN) vivono nella tabella `admin_credentials`
 * (PIN salvato come hash bcrypt) e sono modificabili da Impostazioni.
 * Fallback di bootstrap: se la tabella è vuota o irraggiungibile, usa
 * ADMIN_NICKNAME / ADMIN_PIN dall'ambiente (se presenti) così il primo
 * accesso resta possibile.
 */
export class CookieAuthAdapter implements AuthAdapter {
  async login(identifier: string, secret: string): Promise<boolean> {
    const nickname = identifier.trim();
    const pin = secret.trim();
    if (!nickname || !pin) return false;

    const cred = await getAdminCredential();
    if (!cred) return false;

    if (nickname.toLowerCase() !== cred.nickname.trim().toLowerCase()) return false;

    const pinOk = await bcrypt.compare(pin, cred.pin_hash);
    if (!pinOk) return false;

    const data: SessionData = { nickname: cred.nickname, loggedIn: true };
    const sealed = await sealData(data, {
      password: getSessionSecret(),
      ttl: SESSION_TTL_SECONDS,
    });

    cookies().set(SESSION_COOKIE, sealed, sessionCookieOptions());
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

/**
 * Credenziali admin correnti: prima dal DB, poi (bootstrap) dall'ambiente.
 * Restituisce sempre nickname + hash bcrypt del PIN, mai il PIN in chiaro.
 */
async function getAdminCredential(): Promise<{ nickname: string; pin_hash: string } | null> {
  try {
    const row = await prisma.adminCredential.findUnique({
      where: { key: ADMIN_CRED_KEY },
      select: { nickname: true, pin_hash: true },
    });
    if (row) return row;
  } catch {
    // DB non raggiungibile → prova il fallback d'ambiente sotto.
  }

  const envNick = process.env.ADMIN_NICKNAME;
  const envPin = process.env.ADMIN_PIN;
  if (envNick && envPin) {
    const pin_hash = envPin.startsWith("$2") ? envPin : await bcrypt.hash(envPin, 10);
    return { nickname: envNick, pin_hash };
  }
  return null;
}
