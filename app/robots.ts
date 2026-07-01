import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://deroarts.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admina",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
