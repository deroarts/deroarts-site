import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { updateRequestStatusAction } from "../actions";
import ReplyForm from "@/components/admin/ReplyForm";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";
import CopyChatButton from "@/components/admin/CopyChatButton";
import { formatDateTime } from "@/lib/dates";

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

  // Aprendo la conversazione, segna come letti TUTTI i messaggi ancora "new"
  // dello stesso utente (stessa email): così il pallino "nuovi messaggi" nella
  // lista scompare per quella riga.
  await prisma.request.updateMany({
    where: { email: message.email, direction: "inbound", status: "new" },
    data: { status: "read" },
  });
  if (message.status === "new") message.status = "read";

  const fromAddress = message.project?.from_email || DEFAULT_FROM;
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

  // Testo copiabile dell'intera conversazione (per analisi altrove).
  const chatItems = hasConversation
    ? thread
    : [{ name: message.name, direction: "inbound" as const, message: message.message, created_at: message.created_at }];
  const chatText =
    `Conversazione — ${message.name} · ${fromAddress}\n` +
    `${"-".repeat(40)}\n` +
    chatItems
      .map((m) => {
        const who = m.direction === "outbound" ? "Tu" : m.name;
        const when = formatDateTime(m.created_at);
        return `[${when}] ${who}:\n${m.message}`;
      })
      .join("\n\n");

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-var(--header-h,4rem))]">
      {/* Header consolidato: titolo + email mittente + azioni (contenuto fisso) */}
      <div className="flex items-start gap-3 mb-4 flex-shrink-0">
        <Link
          href="/admina/messaggi"
          className="text-gray-400 hover:text-graphite transition-colors p-1 -m-1 mt-1 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl text-graphite truncate">
            <span className="font-normal text-base text-gray-500">
              {isEmail ? "email" : "messaggio"}{" "}
            </span>
            <span className="font-bold">{message.name}</span>
          </h1>
          <p className="text-xs text-green-end mt-0.5 truncate">{fromAddress}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
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

      {/* Chat: riempie lo spazio rimanente, solo i messaggi scrollano */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
            Messaggi
          </h2>
          <CopyChatButton text={chatText} />
        </div>
        {hasConversation ? (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0">
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
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 text-gray-700 px-3 py-2 text-sm leading-relaxed">
                <div className="text-[11px] font-medium mb-0.5 text-gray-400">
                  {message.name}
                </div>
                <div className="whitespace-pre-wrap">
                  {message.message}
                  <span className="float-right ml-2 mt-1 text-[10px] leading-none translate-y-1 text-gray-400">
                    {message.created_at.toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra di risposta fissa in fondo (fuori dallo scroll) */}
        <div className="border-t border-gray-100 mt-3 pt-1 flex-shrink-0">
          <ReplyForm requestId={message.id} />
        </div>
      </div>
    </div>
  );
}
