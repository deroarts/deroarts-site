import { prisma } from "@/lib/db/client";
import { formatDateTimeSeconds as formatDate } from "@/lib/dates";
import {
  DeleteDevOutboxButton,
  ClearDevOutboxButton,
} from "@/components/admin/DevOutboxActions";
export const dynamic = "force-dynamic";

export const metadata = { title: "Dev Outbox | Admin DeroArts" };

// This page is intentionally only accessible in development (middleware + nav guard).

export default async function DevOutboxPage() {
  if (process.env.MAIL_MODE !== "fake") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-graphite mb-4">Dev Outbox</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p>Dev Outbox disponibile solo quando MAIL_MODE=fake.</p>
        </div>
      </div>
    );
  }

  const messages = await prisma.devOutbox.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-graphite flex items-center gap-2">
            Dev Outbox
            <span className="text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              MAIL_MODE=fake
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {messages.length} email finte — solo in sviluppo
          </p>
        </div>
        {messages.length > 0 && <ClearDevOutboxButton />}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <svg
            className="w-10 h-10 mx-auto mb-3 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="font-medium">Nessuna email</p>
          <p className="text-sm mt-1">
            Invia una richiesta dal sito per vederla qui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <details
              key={msg.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors list-none">
                <svg
                  className="w-4 h-4 text-gray-300 group-open:text-green-end transition-colors flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-graphite truncate">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className="font-mono">{msg.to}</span>
                    <span className="mx-1.5">·</span>
                    <span>da: {msg.from}</span>
                    <span className="mx-1.5">·</span>
                    {formatDate(msg.created_at)}
                  </p>
                </div>
                <DeleteDevOutboxButton id={msg.id} />
                <svg
                  className="w-4 h-4 text-gray-300 flex-shrink-0 group-open:rotate-90 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="border-t border-gray-100 px-5 py-4">
                <div
                  className="text-sm text-gray-700 leading-relaxed rounded-lg overflow-auto"
                  dangerouslySetInnerHTML={{ __html: msg.body }}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
