import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import { updateRequestStatusAction } from "../actions";
import type { RequestStatus } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nuova",
  read: "Letta",
  handled: "Gestita",
};

const STATUS_BADGE_CLASSES: Record<RequestStatus, string> = {
  new: "bg-red-100 text-red-700",
  read: "bg-blue-100 text-blue-700",
  handled: "bg-gray-100 text-gray-600",
};

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RequestDetailPage({ params }: PageProps) {
  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: { project: { select: { slug: true, title: true } } },
  });

  if (!request) notFound();

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/richieste"
          className="text-gray-400 hover:text-graphite transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-graphite">Richiesta</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDateFull(request.created_at)}</p>
        </div>
      </div>

      {/* Status + actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Stato attuale:</span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                STATUS_BADGE_CLASSES[request.status]
              }`}
            >
              {STATUS_LABELS[request.status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {request.status === "new" && (
              <form action={updateRequestStatusAction.bind(null, request.id, "read")}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Segna come letta
                </button>
              </form>
            )}
            {request.status !== "handled" && (
              <form action={updateRequestStatusAction.bind(null, request.id, "handled")}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-green-gradient text-white hover:opacity-90 transition-opacity"
                >
                  Segna come gestita
                </button>
              </form>
            )}
          </div>
        </div>
        {request.handled_at && (
          <p className="text-xs text-gray-400 mt-3">
            Gestita il {formatDateFull(request.handled_at)}
          </p>
        )}
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">
          Informazioni mittente
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <dt className="text-gray-400 w-24 flex-shrink-0">Nome</dt>
            <dd className="font-medium text-graphite">{request.name}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-gray-400 w-24 flex-shrink-0">Email</dt>
            <dd>
              <a
                href={`mailto:${request.email}`}
                className="text-green-end hover:underline"
              >
                {request.email}
              </a>
            </dd>
          </div>
          {request.project && (
            <div className="flex items-center gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Progetto</dt>
              <dd className="flex items-center gap-2">
                <span className="font-medium text-graphite">
                  {t(request.project.title)}
                </span>
                <Link
                  href={`/progetti/${request.project.slug}`}
                  target="_blank"
                  className="text-gray-400 hover:text-green-end transition-colors"
                  title="Apri pagina pubblica"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </dd>
            </div>
          )}
          {!request.project && (
            <div className="flex items-center gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Progetto</dt>
              <dd className="italic text-gray-400">Richiesta generale</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Message */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">
          Messaggio
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-green-end">
          {request.message}
        </div>
      </div>
    </div>
  );
}
