import Link from "next/link";
import { prisma } from "@/lib/db/client";
import ProjectCard from "@/components/ProjectCard";
import HeroFlow from "@/components/HeroFlow";
import type { Metadata } from "next";
import { getSiteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

// ISR: servita da cache statica, rigenerata quando un'azione admin chiama
// revalidatePath("/") o dopo 1h. Niente SSR ad ogni navigazione.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "DeroArts — Software che semplifica la vita",
  description:
    "App, siti e software su misura. Progetti realizzati, curati dall'idea al rilascio.",
  openGraph: {
    title: "DeroArts — Software che semplifica la vita",
    description:
      "App, siti e software su misura, curati dall'idea al rilascio.",
    url: getSiteUrl(),
    siteName: "DeroArts",
    images: [
      { ...DEFAULT_OG_IMAGE, alt: "DeroArts — Software che semplifica la vita" },
    ],
  },
};

// select mirato: le card non usano long_description/gallery (JSONB pesanti).
const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  short_description: true,
  cover_image_url: true,
  status: true,
  category: { select: { name: true } },
} as const;

async function getFeaturedProjects() {
  // ISR: al build (CI, senza DATABASE_URL) il DB non è raggiungibile → invece di
  // rompere il prerender ritorna lista vuota. In produzione il DB c'è e la
  // rigenerazione ISR popola la pagina con i progetti reali.
  try {
    return await prisma.project.findMany({
      where: { published: true },
      select: CARD_SELECT,
      orderBy: { sort_order: "asc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* .hero-screen = standard di progetto: riempie la prima schermata sotto
          l'header e centra il contenuto → hero + CTA sempre visibili (globals.css). */}
      <section className="hero-screen bg-dark-green-gradient relative overflow-hidden">
        {/* alone decorativo */}
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-green-end/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* testo */}
            <div className="max-w-xl">
              <span className="inline-block mb-5 text-green-start text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">
                App · Siti · Software
              </span>
              <h1 className="font-serif max-[359px]:text-3xl text-4xl sm:text-5xl lg:text-[3.4rem] text-white leading-[1.08] mb-6">
                Applicazioni, siti e software{" "}
                <span className="text-gradient-green">costruiti ad hoc.</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-white/85 mt-3">
                  E semplici da usare.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-white/70 mb-9 leading-relaxed max-w-lg">
                Prodotti digitali su misura, curati dall&apos;idea al rilascio:
                architettura solida sotto il cofano, esperienza pulita davanti agli
                occhi. Qualità vera, ad un prezzo alla portata di tutti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/progetti"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
                >
                  Scopri i progetti
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contatti"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Contatti
                </Link>
              </div>
            </div>
            {/* illustrazione — sotto su mobile, a destra su desktop.
                Su mobile è rimpicciolita e centrata così la CTA resta sopra
                la piega; su desktop (lg) torna a piena larghezza di colonna. */}
            <div className="order-first lg:order-last w-full max-w-[260px] sm:max-w-xs mx-auto lg:max-w-none lg:mx-0 opacity-90 lg:opacity-100">
              <HeroFlow />
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured projects ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-green-end text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] mb-2">
              Progetti realizzati
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-graphite leading-tight">
              Prodotti curati nel dettaglio.
              <span className="block italic text-green-end">Prezzi alla portata di tutti.</span>
            </h2>
          </div>
          <Link
            href="/progetti"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-green-end hover:underline shrink-0"
          >
            Vedi tutti
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Nessun progetto disponibile al momento. Torna presto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/progetti"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-end hover:underline"
          >
            Vedi tutti i progetti
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section className="bg-graphite py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-4">
            Hai un&apos;app, un sito o un software da realizzare?
          </h2>
          <p className="text-gray-400 mb-8">
            Descrivi il progetto: verrà valutata la soluzione più adatta, con un
            preventivo onesto e su misura del budget.
          </p>
          <Link
            href="/contatti"
            className="inline-block px-8 py-3.5 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Richiedi informazioni
          </Link>
        </div>
      </section>
    </>
  );
}
