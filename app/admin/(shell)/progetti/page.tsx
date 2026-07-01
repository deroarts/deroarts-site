import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";
import AspectImage from "@/components/AspectImage";
import { togglePublishedAction, moveProjectAction } from "./actions";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const metadata = { title: "Progetti | Admin DeroArts" };

const PAGE_SIZE = 15;

interface PageProps {
  searchParams: { page?: string };
}

export default async function ProgettiAdminPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: { category: true },
      orderBy: { sort_order: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.project.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
          href="/admin/progetti/new"
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-8 px-2 py-3" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Progetto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Stato
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pubbl.
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project, idx) => (
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
                            className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors leading-none"
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
                            className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors leading-none"
                            title="Sposta giù"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 flex-shrink-0">
                          <AspectImage
                            src={project.cover_image_url}
                            alt={t(project.title)}
                            ratio="cover"
                            className="rounded-md"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-graphite">
                            {t(project.title)}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {project.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                      {project.category ? (
                        t(project.category.name)
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-right">
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
                          href={`/admin/progetti/${project.id}/edit`}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-400">
                Pagina {page} di {totalPages} · {total} progetto/i
              </span>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/progetti?page=${page - 1}`}
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
                        href={`/admin/progetti?page=${p}`}
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
                    href={`/admin/progetti?page=${page + 1}`}
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
