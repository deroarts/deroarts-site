import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";
import AspectImage from "@/components/AspectImage";
import { togglePublishedAction } from "./actions";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const metadata = { title: "Progetti | Admin DeroArts" };

export default async function ProgettiAdminPage() {
  const projects = await prisma.project.findMany({
    include: { category: true },
    orderBy: { sort_order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-graphite">Progetti</h1>
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

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="font-medium mb-1">Nessun progetto</p>
          <p className="text-sm">Crea il tuo primo progetto usando il pulsante in alto a destra.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
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
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
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
                        <p className="font-medium text-graphite">{t(project.title)}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                    {project.category ? t(project.category.name) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form
                      action={togglePublishedAction.bind(null, project.id, project.published)}
                    >
                      <button
                        type="submit"
                        title={project.published ? "Pubbl. — clicca per nascondere" : "Non pubbl. — clicca per pubblicare"}
                        className={`w-9 h-5 rounded-full transition-colors ${
                          project.published
                            ? "bg-green-end"
                            : "bg-gray-200"
                        } relative inline-flex items-center`}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            project.published ? "translate-x-4" : "translate-x-0.5"
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
                      <DeleteProjectButton id={project.id} title={t(project.title)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
