// Shared SEO/metadata constants — keep OpenGraph image and site URL in one place
// so layout and every page stay in sync.

/** Public site origin, with the production domain as fallback. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://deroarts.com";
}

/** Default OpenGraph image (1200×630) used across pages that lack a specific one. */
export const DEFAULT_OG_IMAGE = {
  url: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: "DeroArts",
} as const;
