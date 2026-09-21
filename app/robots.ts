import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

// Crawler AI/scraper bloccati: non portano visite reali ma consumano banda
// Render (piano Hobby: 5 GB/mese). Sospensione del 2026-09-20 causata da
// traffico automatico. I motori di ricerca veri restano ammessi.
const BLOCKED_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Google-Extended",
  "FacebookBot",
  "meta-externalagent",
  "PerplexityBot",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "petalbot",
  "Scrapy",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admina",
      },
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
