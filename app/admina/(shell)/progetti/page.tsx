import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";
import AspectImage from "@/components/AspectImage";
import { togglePublishedAction, moveProjectAction } from "./actions";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
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
    include: { category: true },
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
          <p className="text-xs text-gray-400 mt-0.5">
            {total} progetto/i totali
          </p>
        </div>
        <Link
          href="/admina/progetti/new"
          className="px-4 py-2 rounded-xl bg-green-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo progetto
        </Link>
      </div>

      {projects.length === 0 && page === 1 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="font-medium mb-1">Nessun progetto</p>
          <p className="text-sm">
            Crea il tuo primo progetto usando il pulsante in alto a destra.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-graphite border-b border-gray-200">
                <tr>
                  <th className="w-8 px-2 py-3" />
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Progetto
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden sm:table-cell border-l border-white/10">
                    Categoria
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden md:table-cell border-l border-white/10">
                    Stato
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden lg:table-cell border-l border-white/10">
                    Richieste
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Pubbl.
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project, idx) => {
                  const totalReq = totalReqMap.get(project.id) ?? 0;
                  const newReq = newReqMap.get(project.id) ?? 0;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Sort handle */}
                      <td className="px-2 py-3">
                        <div className="flex flex-col gap-0.5 items-center">
                          <form action={moveProjectAction.bind(null, project.id, "up")}>
                            <button
                              type="submit"
                              disabled={idx === 0 && page === 1}
                              className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors leading-none p-1.5"
                              title="Sposta su"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          </form>
                          <form action={moveProjectAction.bind(null, project.id, "down")}>
                            <button
                              type="submit"
                              disabled={idx === projects.length - 1 && page === totalPages}
                              className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors leading-none p-1.5"
                              title="Sposta giù"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>

                      <td className="px-4 py-3 border-l border-gray-100">
                        <Link
                          href={`/admina/progetti/${project.id}/edit`}
                          className="flex items-center gap-3 group/cell -m-2 p-2 rounded-lg hover:bg-green-end/5 transition-colors"
                          title="Apri e modifica il progetto"
                        >
                          <div className="w-16 flex-shrink-0">
                            <AspectImage
                              src={project.cover_image_url}
                              alt={t(project.title)}
                              ratio="cover"
                              className="rounded-md"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-graphite group-hover/cell:text-green-end transition-colors">
                              {t(project.title)}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {project.slug}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 border-l border-gray-100">
                        {project.category ? (
                          t(project.category.name)
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell border-l border-gray-100">
                        <StatusBadge status={project.status} />
                      </td>

                      {/* Request counts */}
                      <td className="px-4 py-3 hidden lg:table-cell border-l border-gray-100">
                        {totalReq === 0 ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <Link
                            href={`/admina/richieste?projectId=${project.id}`}
                            className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            title={`${totalReq} richiesta/e (${newReq} nuova/e)`}
                          >
                            {newReq > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                {newReq} nuova/e
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {totalReq} tot.
                            </span>
                          </Link>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center border-l border-gray-100">
                        <form
                          action={togglePublishedAction.bind(
                            null,
                            project.id,
                            project.published
                          )}
                        >
                          <button
                            type="submit"
                            title={
                              project.published
                                ? "Pubbl. — clicca per nascondere"
                                : "Non pubbl. — clicca per pubblicare"
                            }
                            className={`w-9 h-5 rounded-full transition-colors ${
                              project.published ? "bg-green-end" : "bg-gray-200"
                            } relative inline-flex items-center`}
                          >
                            <span
                              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                project.published
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </form>
                      </td>

                      <td className="px-4 py-3 text-right border-l border-gray-100">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/progetti/${project.slug}`}
                            target="_blank"
                            title="Anteprima pubblica"
                            className="text-gray-400 hover:text-green-end transition-colors p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admina/progetti/${project.id}/edit`}
                            className="text-gray-400 hover:text-graphite transition-colors p-1"
                            title="Modifica"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteProjectButton
                            id={project.id}
                            title={t(project.title)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
