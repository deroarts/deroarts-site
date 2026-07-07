// Shared image validation + compression pipeline.
// Used by both the admin upload (app/api/upload) and the agent upload
// (app/api/agent/upload) so the two stay in sync.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// cover = larger (hero), gallery = standard.
const PURPOSE_CONFIG = {
  cover: { maxWidth: 1920, quality: 82 },
  gallery: { maxWidth: 1280, quality: 80 },
} as const;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB hard cap

export type ImagePurpose = keyof typeof PURPOSE_CONFIG;

/** Validation error → message (Italian) + HTTP status, or null if the file is OK. */
export function validateUpload(
  file: File | null
): { error: string; status: number } | null {
  if (!file || file.size === 0) {
    return { error: "Nessun file fornito.", status: 400 };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: "Tipo di file non supportato. Usa JPEG, PNG o WebP.",
      status: 400,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File troppo grande (max 15 MB).", status: 400 };
  }
  return null;
}

/**
 * Compress an already-validated image to progressive JPEG.
 * Honours EXIF orientation and never enlarges. `purpose` picks the size preset.
 */
export async function compressImage(
  raw: Buffer,
  purpose: string | null
): Promise<Buffer> {
  const cfg =
    PURPOSE_CONFIG[(purpose ?? "gallery") as ImagePurpose] ?? PURPOSE_CONFIG.gallery;

  const sharp = (await import("sharp")).default;
  return sharp(raw)
    .rotate() // honour EXIF orientation
    .resize(cfg.maxWidth, undefined, { withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: cfg.quality, progressive: true })
    .toBuffer();
}
