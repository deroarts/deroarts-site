// AuthAdapter — swappable interface for authentication strategies.
// Current implementation: CookieAuthAdapter (iron-session + bcrypt).
// Future: SupabaseAuthAdapter for hosted deployments.

import type { SessionData } from "./session";

export interface AuthAdapter {
  /** Validate credentials and, on success, write the session cookie. */
  login(email: string, password: string, remember?: boolean): Promise<boolean>;
  /** Destroy the session cookie. */
  logout(): Promise<void>;
  /** Read and validate the current session cookie. Returns null if absent or invalid. */
  getSession(): Promise<SessionData | null>;
}
