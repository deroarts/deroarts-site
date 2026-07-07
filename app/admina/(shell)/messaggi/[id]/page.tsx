import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { updateRequestStatusAction } from "../actions";
import ReplyForm from "@/components/admin/ReplyForm";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

const DEFAULT_FROM = process.env.RESEND_FROM || "info@deroarts.com";

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
  // Per le email ricevute rispondiamo al mittente reale (reply_to_email);
  // per i messaggi dal form l'indirizzo è lo stesso `email`.
  const replyTo = message.reply_to_email || message.email;
  const isEmail = message.source === "email";

  // Carica l'intera conversazione (thread): tutti i messaggi con la stessa
  // thread_key, in ordine cronologico. Se il thread ha più di un messaggio,
  // mostriamo la vista chat; altrimenti resta il classico box "Messaggio".
  const thread = message.thread_key
    ? await prisma.request.findMany({
        where: { thread_key: message.thread_key },
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          message: true,
          direction: true,
          name: true,
          created_at: true,
        },
      })
    : [];
  const hasConversation = thread.length > 1;

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
          <h1 className="text-2xl text-graphite truncate">
            <span className="font-normal">
              {isEmail ? "Email" : "Messaggio"} di{" "}
            </span>
            <span className="font-bold">{message.name}</span>
          </h1>
        </div>
      </div>

      {/* Sender info + quick actions (consolidati in un unico box) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
            Mittente
          </h2>
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
            <dt className="text-gray-400 w-24 flex-shrink-0">Casella</dt>
            <dd className="text-gray-600">{fromAddress}</dd>
          </div>
        </dl>
      </div>

      {/* Conversazione (thread) o messaggio singolo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">
          {hasConversation ? "Conversazione" : "Messaggio"}
        </h2>

        {hasConversation ? (
          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {thread.map((m) => {
              const outbound = m.direction === "outbound";
              return (
                <div
                  key={m.id}
                  className={`flex ${outbound ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      outbound
                        ? "bg-green-gradient text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-700 rounded-bl-sm"
                    }`}
                  >
                    <div
                      className={`text-[11px] font-medium mb-0.5 ${
                        outbound ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {outbound ? "Tu" : m.name}
                    </div>
                    {/* Testo + orario in linea, stile WhatsApp: l'ora sta in basso
                        a destra, e l'ultima riga di testo le lascia spazio. */}
                    <div className="whitespace-pre-wrap">
                      {m.message}
                      <span
                        className={`float-right ml-2 mt-1 text-[10px] leading-none translate-y-1 ${
                          outbound ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {m.created_at.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-green-end">
            {message.message}
          </div>
        )}
      </div>

      {/* Reply */}
      <ReplyForm
        requestId={message.id}
        fromAddress={fromAddress}
        toEmail={replyTo}
        alreadyReplied={Boolean(message.replied_at)}
      />
    </div>
  );
}
