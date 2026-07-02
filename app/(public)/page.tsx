import Link from "next/link";
import { prisma } from "@/lib/db/client";
import ProjectCard from "@/components/ProjectCard";
import type { Metadata } from "next";

// DB-backed page: render at request time, never prerender at build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DeroArts — Software che semplifica la vita",
  description:
    "Soluzioni software semplici e potenti per piccole e medie imprese. Scopri i nostri prodotti e prova le demo gratuite.",
  openGraph: {
    title: "DeroArts — Software che semplifica la vita",
    description:
      "Soluzioni software semplici e potenti per piccole e medie imprese.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://deroarts.com",
    siteName: "DeroArts",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeroArts — Software che semplifica la vita",
      },
    ],
  },
};

async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { sort_order: "asc" },
    take: 3,
  });
}

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-dark-green-gradient relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-start/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-green-end/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-2xl">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 text-green-start text-xs font-semibold uppercase tracking-widest">
              Software artigianale
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Software che{" "}
              <span className="text-gradient-green">semplifica</span>
              <br />
              la vita.
            </h1>
            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
              Creiamo strumenti digitali pensati per chi non ha tempo da perdere.
              Potenti sotto il cofano, semplicissimi da usare ogni giorno.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/progetti"
                className="px-7 py-3.5 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Scopri i progetti
              </Link>
              <Link
                href="/contatti"
                className="px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured projects ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-green-end text-sm font-semibold uppercase tracking-wider mb-1">
              I nostri prodotti
            </p>
            <h2 className="text-3xl font-bold text-graphite">
              Progetti in evidenza
            </h2>
          </div>
          <Link
            href="/progetti"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-green-end hover:underline"
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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Hai un&apos;idea o una necessità?
          </h2>
          <p className="text-gray-400 mb-8">
            Parla con noi. Troviamo insieme la soluzione giusta per la tua realtà.
          </p>
          <Link
            href="/contatti"
            className="inline-block px-8 py-3.5 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Scrivici ora
          </Link>
        </div>
      </section>
    </>
  );
}
