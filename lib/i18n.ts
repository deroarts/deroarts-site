// Helpers for reading JSONB translatable fields from the DB.
// Shape: { "it": "...", "en": "" }

export type I18nString = { it: string; en: string };
export type GalleryItem = { url: string; alt: I18nString };

/** Extract the Italian (or fallback to English) text from a JSONB translation field. */
export function t(field: unknown, lang: "it" | "en" = "it"): string {
  if (!field || typeof field !== "object" || Array.isArray(field)) return "";
  const obj = field as Record<string, string>;
  return obj[lang] || obj["it"] || obj["en"] || "";
}

/** Parse a JSONB gallery array safely. */
export function parseGallery(gallery: unknown): GalleryItem[] {
  if (!Array.isArray(gallery)) return [];
  return (gallery as GalleryItem[]).filter(
    (item) => item && typeof item.url === "string"
  );
}

/** Italian labels for ProjectStatus enum values. */
export const STATUS_LABELS: Record<string, string> = {
  available: "Disponibile",
  coming_soon: "Prossimamente",
  demo_available: "Demo disponibile",
};

/** Italian label for an ActionType button. */
export const ACTION_LABELS: Record<string, string> = {
  demo: "Prova la demo",
  request_info: "Richiedi informazioni",
  download: "Scarica",
  app_store: "App Store",
  play_store: "Google Play",
  external: "Vai al sito",
};
