import { prisma } from "@/lib/db/client";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { t } from "@/lib/i18n";
import { PROJECT_CARD_ORDER, PROJECT_CARD_SELECT } from "@/lib/project-card";
import ProjectSection from "@/components/ProjectSection";

// ISR: cache statica rigenerata da revalidatePath("/progetti") (chiamato dalle
// azioni admin su progetti/categorie) o dopo 1h. Le varianti ?categoria=… sono
// rese dinamicamente per-richiesta ma condividono la stessa cache invalidabile.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Progetti | DeroArts",
  description:
    "Applicazioni, siti web e software gestionali realizzati da DeroArts. Scopri i progetti e prova le demo.",
  openGraph: {
    title: "Progetti | DeroArts",
    description: "Applicazioni, siti web e software gestionali — semplici, curati, italiani.",
    images: [DEFAULT_OG_IMAGE],
  },
};

interface PageProps {
  searchParams: { categoria?: string };
}

// Una sezione per categoria: nomi e ordine li decide l'admin (/admina/categorie).
// Una categoria senza progetti pubblicati resta nascosta e compare da sola al
// primo progetto pubblicato. I progetti senza categoria vanno in fondo.
async function getSections() {
  const [categories, uncategorized] = await Promise.all([
    prisma.category.findMany({
      where: { projects: { some: { published: true } } },
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
      select: {
        slug: true,
        name: true,
        projects: {
          where: { published: true },
          select: PROJECT_CARD_SELECT,
          orderBy: PROJECT_CARD_ORDER,
        },
      },
    }),
    prisma.project.findMany({
      where: { published: true, category_id: null },
      select: PROJECT_CARD_SELECT,
      orderBy: PROJECT_CARD_ORDER,
    }),
  ]);

  const sections = categories.map((c) => ({
    slug: c.slug,
    title: t(c.name),
    projects: c.projects,
  }));
  if (uncategorized.length > 0) {
    sections.push({ slug: "altri-progetti", title: "Altri progetti", projects: uncategorized });
  }
  return sections;
}

export default async function ProgettiPage({ searchParams }: PageProps) {
  const all = await getSections();
  // ?categoria=<slug> mostra solo quella sezione (link diretti); slug sconosciuto → tutte.
  const only = all.filter((s) => s.slug === searchParams.categoria);
  const sections = only.length > 0 ? only : all;

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
        <p className="text-gray-500 max-w-2xl text-balance">
          <span className="block">Software pensato per le&nbsp;persone.</span>
          <span className="block">
            Ogni&nbsp;strumento nasce da&nbsp;una&nbsp;necessità&nbsp;reale e&nbsp;viene affinato
            nel&nbsp;tempo.
          </span>
        </p>
      </div>

      {sections.length === 0 ? (
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
          <p className="font-medium">Nessun progetto disponibile al momento.</p>
          <p className="text-sm mt-1">Torna presto!</p>
        </div>
      ) : (
        // Griglia unica a 3 colonne: ogni sezione ne occupa quante gliene servono
        // (vedi ProjectSection) e le sezioni piccole si affiancano sulla stessa riga.
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {sections.map((s) => (
            <ProjectSection key={s.slug} slug={s.slug} title={s.title} projects={s.projects} />
          ))}
        </div>
      )}
    </div>
  );
}
