/**
 * Auth factory — returns the configured AuthAdapter.
 * Today: CookieAuthAdapter (iron-session).
 * Future swap: set AUTH_ADAPTER=supabase → return SupabaseAuthAdapter.
 */

import type { AuthAdapter } from "./adapter";
import { CookieAuthAdapter } from "./cookie-adapter";

export type { AuthAdapter };

let _adapter: AuthAdapter | null = null;

export function getAuthAdapter(): AuthAdapter {
  if (!_adapter) {
    // Switch here when adding more adapter types
    _adapter = new CookieAuthAdapter();
  }
  return _adapter;
}

// ── Convenience helpers (used by server actions and layouts) ─────────────────

export async function login(nickname: string, pin: string, remember = true) {
  return getAuthAdapter().login(nickname, pin, remember);
}

export async function logout() {
  return getAuthAdapter().logout();
}

export async function getSession() {
  return getAuthAdapter().getSession();
}

/**
 * True se la richiesta è autorizzata come admin.
 * In sviluppo con DEV_UA_SWITCH=true non esiste una sessione (accesso libero per
 * il DevSwitcher): in quel caso l'admin è considerato autorizzato. In produzione
 * (flag assente) la sessione resta obbligatoria.
 */
export async function requireAdmin(): Promise<boolean> {
  if (process.env.DEV_UA_SWITCH === "true") return true;
  return Boolean(await getSession());
}
