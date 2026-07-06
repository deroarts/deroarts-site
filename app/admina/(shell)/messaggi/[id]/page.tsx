import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import { updateRequestStatusAction } from "../actions";
import ReplyForm from "@/components/admin/ReplyForm";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";
import type { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

const DEFAULT_FROM = process.env.RESEND_FROM || "info@deroarts.com";

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nuovo",
  read: "Letto",
  handled: "Gestito",
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

export default async function MessaggioDetailPage({ params }: PageProps) {
  const message = await prisma.request.findUnique({
    where: { id: params.id },
    include: { project: { select: { slug: true, title: true, from_email: true } } },
  });

  if (!message) notFound();

  // Auto-mark as read on first open (don't downgrade a handled message).
  if (message.status === "new") {
    await prisma.request.update({
      where: { id: message.id },
      data: { status: "read" },
    });
    message.status = "read";
  }

  const fromAddress = message.project?.from_email || DEFAULT_FROM;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admina/messaggi"
          className="text-gray-400 hover:text-graphite transition-colors p-1 -m-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-graphite">Messaggio</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateFull(message.created_at)}
          </p>
        </div>
      </div>

      {/* Status + quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Stato:</span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                STATUS_BADGE_CLASSES[message.status]
              }`}
            >
              {STATUS_LABELS[message.status]}
            </span>
            {message.replied_at && (
              <span className="text-xs text-green-end font-medium inline-flex items-center gap-1">
                ↩ Risposto
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {message.status !== "handled" && (
              <form action={updateRequestStatusAction.bind(null, message.id, "handled")}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-green-gradient text-white hover:opacity-90 transition-opacity"
                >
                  Segna come gestito
                </button>
              </form>
            )}
            {message.status === "handled" && (
              <form action={updateRequestStatusAction.bind(null, message.id, "read")}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Riapri
                </button>
              </form>
            )}
            <DeleteMessageButton id={message.id} />
          </div>
        </div>
      </div>

      {/* Sender info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">
          Mittente
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <dt className="text-gray-400 w-24 flex-shrink-0">Nome</dt>
            <dd className="font-medium text-graphite">{message.name}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-gray-400 w-24 flex-shrink-0">Email</dt>
            <dd>
              <a
                href={`mailto:${message.email}`}
                className="text-green-end hover:underline"
              >
                {message.email}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-gray-400 w-24 flex-shrink-0">Progetto</dt>
            <dd className="flex items-center gap-2 min-w-0">
              {message.project ? (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-end/10 text-green-end">
                    {t(message.project.title)}
                  </span>
                  <Link
                    href={`/progetti/${message.project.slug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-green-end transition-colors flex-shrink-0"
                    title="Apri pagina pubblica"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </>
              ) : (
                <span className="italic text-gray-400">Richiesta generale</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Message body */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">
          Messaggio
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-green-end">
          {message.message}
        </div>
      </div>

      {/* Reply */}
      <ReplyForm
        requestId={message.id}
        fromAddress={fromAddress}
        toEmail={message.email}
        alreadyReplied={Boolean(message.replied_at)}
      />
    </div>
  );
}
