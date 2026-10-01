import type { Prisma } from "@prisma/client";

// Campi letti da <ProjectCard>: select mirato condiviso da home e /progetti
// (le card non usano long_description/gallery, JSONB pesanti).
export const PROJECT_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  short_description: true,
  cover_image_url: true,
  status: true,
  published: true,
  category: { select: { name: true } },
} as const;

// Anteprima delle bozze: solo sul computer di sviluppo (`next dev`), mai online.
// In produzione NODE_ENV non è "development" e il ramo sparisce dal build.
export const DEV_DRAFTS = process.env.NODE_ENV === "development";

// Ordine pubblico dei progetti: quello scelto dall'admin, poi il più vecchio.
export const PROJECT_CARD_ORDER: Prisma.ProjectOrderByWithRelationInput[] = [
  { sort_order: "asc" },
  { created_at: "asc" },
];
