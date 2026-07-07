import { prisma } from "@/lib/db/client";
import ProjectCard from "@/components/ProjectCard";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

// DB-backed page: render at request time, never prerender at build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progetti | DeroArts",
  description:
    "Esplora tutti i progetti DeroArts: software gestionali, utilità e molto altro. Filtra per categoria e scopri le demo.",
  openGraph: {
    title: "Progetti | DeroArts",
    description: "Esplora i software DeroArts — semplici, potenti, italiani.",
    images: [DEFAULT_OG_IMAGE],
  },
};

interface PageProps {
  searchParams: { categoria?: string };
}

async function getPageData(categoriaSlug?: string) {
  const projects = await prisma.project.findMany({
    where: {
      published: true,
      ...(categoriaSlug ? { category: { slug: categoriaSlug } } : {}),
    },
    include: { category: true },
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
  });
  return { projects };
}

export default async function ProgettiPage({ searchParams }: PageProps) {
  const { categoria } = searchParams;
  const { projects } = await getPageData(categoria);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-green-end text-sm font-semibold uppercase tracking-wider mb-1">
          Il lavoro
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-graphite mb-3">
          Progetti realizzati
        </h1>
        <p className="text-gray-500 max-w-xl">
          Software pensato per le persone. Ogni strumento nasce da una necessità
          reale e viene affinato nel tempo.
        </p>
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">Nessun progetto in questa categoria.</p>
          <p className="text-sm mt-1">Prova a selezionare un&apos;altra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
