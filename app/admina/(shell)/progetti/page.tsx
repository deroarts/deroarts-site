import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import ProjectCardMobile from "@/components/admin/ProjectCardMobile";
import ProjectTableDesktop from "@/components/admin/ProjectTableDesktop";
export const dynamic = "force-dynamic";

export const metadata = { title: "Progetti | Admin DeroArts" };

const PAGE_SIZE = 15;

interface PageProps {
  searchParams: { page?: string };
}

export default async function ProgettiAdminPage({ searchParams }: PageProps) {
  const requestedPage = Math.max(1, parseInt(searchParams.page ?? "1") || 1);

  const total = await prisma.project.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Clamp to the last real page so ?page=99 never shows an empty table.
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * PAGE_SIZE;

  const projects = await prisma.project.findMany({
    // La tabella admin non usa gallery/long_description/short_description (JSONB).
    select: {
      id: true,
      slug: true,
      title: true,
      cover_image_url: true,
      status: true,
      published: true,
      category: { select: { name: true } },
    },
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    skip,
    take: PAGE_SIZE,
  });
  const projectIds = projects.map((p) => p.id);

  // Per-project request counts for the current page
  const [totalReqStats, newReqStats] = await Promise.all([
    prisma.request.groupBy({
      by: ["project_id"],
      where: { project_id: { in: projectIds } },
      _count: { _all: true },
    }),
    prisma.request.groupBy({
      by: ["project_id"],
      where: { project_id: { in: projectIds }, status: "new" },
      _count: { _all: true },
    }),
  ]);

  const totalReqMap = new Map(
    totalReqStats.map((r) => [r.project_id as string, r._count._all])
  );
  const newReqMap = new Map(
    newReqStats.map((r) => [r.project_id as string, r._count._all])
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Progetti</h1>
        </div>
        {/* Desktop: pulsante inline */}
        <Link
          href="/admina/progetti/new"
          className="hidden md:inline-flex px-4 py-2 rounded-xl bg-green-deep text-white text-sm font-semibold hover:opacity-90 transition-opacity items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo progetto
        </Link>
      </div>

      {/* Mobile: FAB flottante (azione primaria, pollice-friendly). */}
      <Link
        href="/admina/progetti/new"
        aria-label="Nuovo progetto"
        className="md:hidden fixed bottom-safe right-4 z-30 w-14 h-14 rounded-full bg-green-deep text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {projects.length === 0 && page === 1 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="font-medium mb-1">Nessun progetto</p>
          <p className="text-sm">
            Crea il tuo primo progetto usando il pulsante in alto a destra.
          </p>
        </div>
      ) : (
        <>
          {/* ── Mobile: card impilate (no scroll orizzontale) ─────────────── */}
          <ul className="md:hidden space-y-2.5">
            {projects.map((project, idx) => (
              <li key={project.id}>
                <ProjectCardMobile
                  id={project.id}
                  slug={project.slug}
                  title={t(project.title)}
                  coverUrl={project.cover_image_url}
                  categoryName={project.category ? t(project.category.name) : null}
                  status={project.status}
                  published={project.published}
                  totalReq={totalReqMap.get(project.id) ?? 0}
                  newReq={newReqMap.get(project.id) ?? 0}
                  isFirst={idx === 0 && page === 1}
                  isLast={idx === projects.length - 1 && page === totalPages}
                />
              </li>
            ))}
          </ul>

          {/* ── Desktop: tabella ──────────────────────────────────────────── */}
          <ProjectTableDesktop
            projects={projects}
            totalReqMap={totalReqMap}
            newReqMap={newReqMap}
            page={page}
            totalPages={totalPages}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-400">
                Pagina {page} di {totalPages} · {total} progetto/i
              </span>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/admina/progetti?page=${page - 1}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium"
                  >
                    ← Precedente
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                  )
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-1 text-gray-300">…</span>
                      )}
                      <Link
                        href={`/admina/progetti?page=${p}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-green-gradient text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}
                {page < totalPages && (
                  <Link
                    href={`/admina/progetti?page=${page + 1}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium"
                  >
                    Successiva →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
