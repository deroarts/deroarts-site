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

export async function login(email: string, password: string, remember = true) {
  return getAuthAdapter().login(email, password, remember);
}

export async function logout() {
  return getAuthAdapter().logout();
}

export async function getSession() {
  return getAuthAdapter().getSession();
}
