/**
 * Short-lived HMAC-SHA256 signed preview token.
 * Allows admins to view unpublished projects without exposing them publicly.
 *
 * Token format (base64url): "<slug>:<expires_unix>:<hmac_hex>"
 * Default TTL: 1 hour.
 */

import crypto from "crypto";

const TTL_SECONDS = 60 * 60; // 1 hour

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET not configured");
  return s;
}

/** Generate a signed preview token for the given slug. */
export function signPreviewToken(slug: string): string {
  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${slug}:${expires}`;
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  const raw = `${payload}:${hmac}`;
  return Buffer.from(raw).toString("base64url");
}

/** Verify a preview token. Returns the slug if valid, null if invalid/expired. */
export function verifyPreviewToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split(":");
    if (parts.length !== 3) return null;
    const [slug, expiresStr, providedHmac] = parts;

    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires) || Date.now() / 1000 > expires) return null;

    const payload = `${slug}:${expires}`;
    const expectedHmac = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    const valid = crypto.timingSafeEqual(
      Buffer.from(providedHmac, "hex"),
      Buffer.from(expectedHmac, "hex")
    );

    return valid ? slug : null;
  } catch {
    return null;
  }
}
