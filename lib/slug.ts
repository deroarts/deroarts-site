// Canonical slug generator: lowercase, de-accent Italian vowels, collapse
// non-alphanumerics into hyphens. Shared by the admin form (client) and the
// agent projects endpoint (server) so both produce identical slugs.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâã]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
