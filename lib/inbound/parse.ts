// Helpers per trasformare una email ricevuta (Resend Inbound) in un messaggio.

/**
 * Estrae nome e indirizzo da un header "From" tipo:
 *   "Mario Rossi <mario@example.com>"  →  { name: "Mario Rossi", email: "mario@example.com" }
 *   "mario@example.com"                →  { name: "mario",       email: "mario@example.com" }
 */
export function parseFrom(from: string): { name: string; email: string } {
  const raw = (from || "").trim();
  const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) {
    const name = match[1].trim();
    const email = match[2].trim().toLowerCase();
    return { name: name || email.split("@")[0], email };
  }
  // Nessun display name: usa la parte prima della @ come nome.
  const email = raw.toLowerCase();
  const name = email.includes("@") ? email.split("@")[0] : email || "Sconosciuto";
  return { name, email };
}

/**
 * Ricava il "local part" dell'alias a cui era indirizzata la mail, a partire
 * dagli indirizzi in `received_for` / `to`. Es. "stickers@deroarts.com" → "stickers".
 * Ignora l'indirizzo tecnico *.resend.app (è solo il tramite dell'inoltro).
 */
export function aliasLocalPart(
  receivedFor: string[] | null | undefined,
  to: string[] | null | undefined
): string | null {
  const candidates = [...(receivedFor ?? []), ...(to ?? [])]
    .map((a) => a.toLowerCase().trim())
    .filter((a) => a && !a.endsWith(".resend.app"));
  // Preferisci un indirizzo @deroarts.com se presente.
  const deroarts = candidates.find((a) => a.endsWith("@deroarts.com"));
  const chosen = deroarts ?? candidates[0];
  if (!chosen || !chosen.includes("@")) return null;
  return chosen.split("@")[0] || null;
}

/**
 * Normalizza il corpo del messaggio: preferisce il testo semplice; se manca,
 * riduce l'HTML a testo leggibile (via strip dei tag). Taglia a una lunghezza
 * ragionevole per lo storage (le email lunghe restano comunque su Resend).
 */
export function bodyToText(text: string | null, html: string | null): string {
  if (text && text.trim()) return text.trim().slice(0, 20000);
  if (html && html.trim()) {
    const stripped = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return stripped.slice(0, 20000) || "(messaggio senza testo)";
  }
  return "(messaggio senza testo)";
}
