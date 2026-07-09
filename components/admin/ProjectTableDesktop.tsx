import Link from "next/link";
import { t } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";
import AspectImage from "@/components/AspectImage";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import { togglePublishedAction, moveProjectAction } from "@/app/admina/(shell)/progetti/actions";

interface ProjectRow {
  id: string;
  slug: string;
  title: unknown;
  cover_image_url: string | null;
  status: string;
  published: boolean;
  category: { name: unknown } | null;
}

interface Props {
  projects: ProjectRow[];
  totalReqMap: Map<string, number>;
  newReqMap: Map<string, number>;
  page: number;
  totalPages: number;
}

/** Tabella progetti per desktop (su mobile si usa ProjectCardMobile). */
export default function ProjectTableDesktop({
  projects,
  totalReqMap,
  newReqMap,
  page,
  totalPages,
}: Props) {
  return (
    <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-green-deep border-b border-gray-200">
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
              <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Sort handle */}
                <td className="px-2 py-3">
                  <div className="flex flex-col gap-0.5 items-center">
                    <form action={moveProjectAction.bind(null, project.id, "up")}>
                      <button
                        type="submit"
                        disabled={idx === 0 && page === 1}
                        className="text-green-deep hover:text-green-end disabled:opacity-20 transition-colors leading-none p-1.5"
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
                        className="text-green-deep hover:text-green-end disabled:opacity-20 transition-colors leading-none p-1.5"
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
                    </div>
                  </Link>
                </td>

                <td className="px-4 py-3 hidden sm:table-cell text-gray-500 border-l border-gray-100 text-center">
                  {project.category ? t(project.category.name) : <span className="text-gray-300">—</span>}
                </td>

                <td className="px-4 py-3 hidden md:table-cell border-l border-gray-100 text-center">
                  <StatusBadge status={project.status} />
                </td>

                {/* Request counts */}
                <td className="px-4 py-3 hidden lg:table-cell border-l border-gray-100 text-center">
                  {totalReq === 0 ? (
                    <span className="text-gray-300 text-xs">—</span>
                  ) : (
                    <Link
                      href={`/admina/messaggi?projectId=${project.id}`}
                      className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      title={`${totalReq} messaggio/i (${newReq} nuovo/i)`}
                    >
                      {newReq > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          {newReq} nuova/e
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{totalReq} tot.</span>
                    </Link>
                  )}
                </td>

                <td className="px-4 py-3 text-center border-l border-gray-100">
                  <form action={togglePublishedAction.bind(null, project.id, project.published)}>
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
                          project.published ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </form>
                </td>

                <td className="px-4 py-3 text-center border-l border-gray-100">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/progetti/${project.slug}`}
                      target="_blank"
                      title="Anteprima pubblica"
                      className="text-gray-400 hover:text-green-end transition-colors p-1.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admina/progetti/${project.id}/edit`}
                      className="text-gray-400 hover:text-graphite transition-colors p-1.5"
                      title="Modifica"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <DeleteProjectButton id={project.id} title={t(project.title)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
