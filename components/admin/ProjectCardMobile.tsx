import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import AspectImage from "@/components/AspectImage";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import { togglePublishedAction, moveProjectAction } from "@/app/admina/(shell)/progetti/actions";

interface Props {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  categoryName: string | null;
  status: string;
  published: boolean;
  totalReq: number;
  newReq: number;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Card progetto per mobile: sostituisce la tabella (che su mobile richiedeva
 * scroll orizzontale). Azioni a destra, comode al pollice. Desktop usa la tabella.
 */
export default function ProjectCardMobile({
  id,
  slug,
  title,
  coverUrl,
  categoryName,
  status,
  published,
  totalReq,
  newReq,
  isFirst,
  isLast,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center gap-3">
        {/* Riordino */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <form action={moveProjectAction.bind(null, id, "up")}>
            <button
              type="submit"
              disabled={isFirst}
              className="text-green-deep hover:text-green-end disabled:opacity-20 transition-colors p-1.5 -m-0.5 block"
              title="Sposta su"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </form>
          <form action={moveProjectAction.bind(null, id, "down")}>
            <button
              type="submit"
              disabled={isLast}
              className="text-green-deep hover:text-green-end disabled:opacity-20 transition-colors p-1.5 -m-0.5 block"
              title="Sposta giù"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Cover + info (tap → modifica) */}
        <Link
          href={`/admina/progetti/${id}/edit`}
          className="flex items-center gap-3 min-w-0 flex-1 -m-1 p-1 rounded-lg"
        >
          <div className="w-16 flex-shrink-0">
            <AspectImage src={coverUrl} alt={title} ratio="cover" className="rounded-md" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-graphite truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
              {categoryName && (
                <span className="text-xs text-gray-400 truncate">{categoryName}</span>
              )}
            </div>
            {totalReq > 0 && (
              <p className="text-[11px] text-gray-400 mt-1">
                {newReq > 0 && (
                  <span className="font-semibold text-red-600">{newReq} nuovo/i · </span>
                )}
                {totalReq} messaggio/i
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Azioni a destra */}
      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-50">
        {/* Toggle pubblica */}
        <form action={togglePublishedAction.bind(null, id, published)} className="mr-auto">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs font-medium text-gray-500 px-2 py-1.5"
            title={published ? "Pubblicato — tocca per nascondere" : "Non pubblicato — tocca per pubblicare"}
          >
            <span
              className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center ${
                published ? "bg-green-end" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                  published ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
            {published ? "Pubblicato" : "Bozza"}
          </button>
        </form>

        <Link
          href={`/progetti/${slug}`}
          target="_blank"
          title="Anteprima pubblica"
          className="text-gray-400 hover:text-green-end transition-colors p-2.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
        <Link
          href={`/admina/progetti/${id}/edit`}
          title="Modifica"
          className="text-gray-400 hover:text-graphite transition-colors p-2.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <DeleteProjectButton id={id} title={title} />
      </div>
    </div>
  );
}
