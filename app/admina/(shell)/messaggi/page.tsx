import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import type { RequestStatus, Prisma } from "@prisma/client";
import MessaggiFilters from "@/components/admin/MessaggiFilters";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messaggi | Admin DeroArts" };

const PAGE_SIZE = 20;

// Indirizzo @deroarts.com "a cui" è arrivato il messaggio: quello del progetto
// se impostato, altrimenti la casella di default (RESEND_FROM / info@).
const DEFAULT_MAILBOX = process.env.RESEND_FROM || "info@deroarts.com";
function mailboxFor(project: { from_email: string | null } | null): string {
  return project?.from_email || DEFAULT_MAILBOX;
}

const TAB_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Tutti", value: "" },
  { label: "Nuovi", value: "new" },
  { label: "Letti", value: "read" },
  { label: "Gestiti", value: "handled" },
];

interface PageProps {
  searchParams: {
    status?: string;
    projectId?: string;
    q?: string;
    page?: string;
  };
}

function formatDate(d: Date): string {
  // Es. "07 Luglio 2026" — giorno a 2 cifre, mese esteso con iniziale maiuscola.
  const s = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return s.replace(/ (\p{Ll})/u, (_, c) => " " + c.toUpperCase());
}

export default async function MessaggiAdminPage({ searchParams }: PageProps) {
  const statusFilter = (searchParams.status ?? "") as RequestStatus | "";
  const projectFilter = searchParams.projectId ?? "";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  // Build the where clause from all active filters.
  // La lista mostra solo i messaggi RICEVUTI (inbound): le risposte inviate
  // dall'admin (outbound) vivono dentro il thread, non come righe a sé.
  const where: Prisma.RequestWhereInput = { direction: "inbound" };
  if (statusFilter && ["new", "read", "handled"].includes(statusFilter)) {
    where.status = statusFilter as RequestStatus;
  }
  if (projectFilter) where.project_id = projectFilter;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  // Carico i messaggi ricevuti (inbound) che matchano i filtri, poi collasso
  // ogni CONVERSAZIONE in una sola riga: tengo il messaggio più recente per
  // `thread_key`. I messaggi senza thread_key (rari/legacy) restano singoli.
  // Volumi free-tier bassi → dedup in JS, semplice e leggibile.
  const [inboundRows, projects] = await Promise.all([
    prisma.request.findMany({
      where,
      include: { project: { select: { slug: true, title: true, from_email: true } } },
      orderBy: { created_at: "desc" },
    }),
    prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { sort_order: "asc" },
    }),
  ]);

  // Dedup per thread (l'array è già ordinato per data desc → il primo è l'ultimo msg).
  function dedupeByThread<T extends { id: string; thread_key: string | null }>(rows: T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const r of rows) {
      const key = r.thread_key ?? `id:${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }

  const conversations = dedupeByThread(inboundRows);

  // Conteggi per tab = numero di CONVERSAZIONI (non di singoli messaggi).
  // Per i contatori serve l'insieme completo (senza filtro stato), deduplicato.
  const allInbound =
    statusFilter || projectFilter || q
      ? await prisma.request.findMany({
          where: { direction: "inbound" },
          select: { id: true, thread_key: true, status: true },
          orderBy: { created_at: "desc" },
        })
      : inboundRows.map((r) => ({ id: r.id, thread_key: r.thread_key, status: r.status }));
  const allConversations = dedupeByThread(allInbound);
  const newCount = allConversations.filter((c) => c.status === "new").length;
  const readCount = allConversations.filter((c) => c.status === "read").length;
  const handledCount = allConversations.filter((c) => c.status === "handled").length;

  // Paginazione applicata al set deduplicato.
  const total = conversations.length;
  const messages = conversations.slice(skip, skip + PAGE_SIZE);

  const allCount = allConversations.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tabCounts: Record<string, number> = {
    "": allCount,
    new: newCount,
    read: readCount,
    handled: handledCount,
  };

  // Preserve active filters across tab/pagination links.
  function buildHref(overrides: {
    status?: string;
    projectId?: string;
    q?: string;
    page?: number;
  }) {
    const p = new URLSearchParams();
    const status = "status" in overrides ? overrides.status : statusFilter;
    const projectId =
      "projectId" in overrides ? overrides.projectId : projectFilter;
    const query = "q" in overrides ? overrides.q : q;
    const page = overrides.page;

    if (status) p.set("status", status);
    if (projectId) p.set("projectId", projectId);
    if (query && query.trim()) p.set("q", query.trim());
    if (page && page > 1) p.set("page", String(page));

    const qs = p.toString();
    return `/admina/messaggi${qs ? `?${qs}` : ""}`;
  }

  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: t(p.title as Record<string, string>),
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-h,4rem))]">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-graphite">Messaggi</h1>
      </div>

      {/* Filtri: tutto su una sola riga — cerca a sx, progetti, tab stato */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <MessaggiFilters
          projects={projectOptions}
          currentProjectId={projectFilter}
          currentQuery={q}
          currentStatus={statusFilter}
        />

        {/* Tab stato — senza contenitore/sfondo */}
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {TAB_OPTIONS.map((tab) => {
            const active = statusFilter === tab.value;
            const isNew = tab.value === "new" && tabCounts[tab.value] > 0;
            return (
              <Link
                key={tab.value}
                href={buildHref({ status: tab.value || undefined, page: undefined })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "text-green-end"
                    : "text-gray-500 hover:text-graphite"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isNew
                      ? "bg-red-100 text-red-700"
                      : active
                      ? "bg-green-end/10 text-green-end"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {tabCounts[tab.value]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 mt-4">
          <p className="font-medium mb-1">Nessun messaggio</p>
          <p className="text-sm">
            {statusFilter || projectFilter || q
              ? "Nessun messaggio con questi filtri."
              : "Non sono ancora arrivati messaggi."}
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* ── Mobile: card impilate (esperienza nativa) ────────────────── */}
          <ul className="md:hidden overflow-y-auto flex-1 min-h-0 space-y-2.5">
            {messages.map((req) => {
              const isNew = req.status === "new";
              return (
                <li key={req.id}>
                  <Link
                    href={`/admina/messaggi/${req.id}`}
                    className={`block bg-white rounded-2xl border shadow-sm p-4 active:scale-[0.99] transition-transform ${
                      isNew ? "border-red-200" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isNew && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <OriginIcon source={req.source} />
                        <span
                          className={`truncate ${
                            isNew
                              ? "font-semibold text-graphite"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {req.name}
                        </span>
                        {req.replied_at && (
                          <span className="text-green-end flex-shrink-0" title="Hai risposto">
                            ↩
                          </span>
                        )}
                      </div>
                      <StatusPill status={req.status} />
                    </div>
                    {req.source === "email" && req.subject ? (
                      <p className="text-xs text-gray-500 truncate mb-1 font-medium">
                        {req.subject}
                      </p>
                    ) : null}
                    <p className="text-xs text-gray-400 truncate mb-0.5">
                      {req.email}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mb-2">
                      <span className="text-gray-300">a:</span> {mailboxFor(req.project)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {req.project ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-end/10 text-green-end truncate max-w-[60%]">
                          {t(req.project.title)}
                        </span>
                      ) : (
                        <span className="text-xs italic text-gray-400">Generale</span>
                      )}
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Desktop: tabella (scroll interno, pagina fissa) ──────────── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto flex-1 min-h-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-green-deep border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="w-3 px-1 py-3" />
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Data
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Nome
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden lg:table-cell border-l border-white/10">
                    Casella
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Progetto
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden md:table-cell border-l border-white/10">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Stato
                  </th>
                  <th className="w-10 px-2 py-3 border-l border-white/10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((req) => {
                  const isNew = req.status === "new";
                  return (
                    <tr
                      key={req.id}
                      className={`transition-colors ${
                        isNew ? "bg-red-50/40" : ""
                      } hover:bg-green-end/5`}
                    >
                      {/* Unread dot */}
                      <td className="px-1 py-3">
                        {isNew && (
                          <span
                            className="block w-2 h-2 rounded-full bg-red-500 mx-auto"
                            title="Nuovo"
                          />
                        )}
                      </td>

                      <td className="px-0 py-0 border-l border-gray-300">
                        <Link
                          href={`/admina/messaggi/${req.id}`}
                          className="block px-4 py-3 text-xs text-gray-600 whitespace-nowrap text-center hover:text-graphite"
                        >
                          {formatDate(req.created_at)}
                        </Link>
                      </td>

                      <td className="px-0 py-0 border-l border-gray-300 text-center">
                        <Link
                          href={`/admina/messaggi/${req.id}`}
                          className={`block px-4 py-3 hover:text-green-end transition-colors ${
                            isNew
                              ? "font-semibold text-graphite"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {req.name}
                            {req.replied_at && (
                              <span className="text-green-end" title="Hai risposto">
                                ↩
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>

                      <td className="px-0 py-0 hidden lg:table-cell border-l border-gray-300 text-center text-sm text-gray-700">
                        <Link href={`/admina/messaggi/${req.id}`} className="block px-4 py-3">
                          {mailboxFor(req.project)}
                        </Link>
                      </td>

                      <td className="px-0 py-0 border-l border-gray-300 text-center">
                        <Link href={`/admina/messaggi/${req.id}`} className="block px-4 py-3">
                          {req.project ? (
                            <span className="text-xs font-medium text-green-end">
                              {t(req.project.title)}
                            </span>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              Generale
                            </span>
                          )}
                        </Link>
                      </td>

                      <td className="px-0 py-0 hidden md:table-cell border-l border-gray-300 text-center text-sm text-gray-700">
                        <Link href={`/admina/messaggi/${req.id}`} className="block px-4 py-3 hover:text-green-end transition-colors">
                          {req.email}
                        </Link>
                      </td>

                      <td className="px-0 py-0 border-l border-gray-300 text-center">
                        <Link href={`/admina/messaggi/${req.id}`} className="block px-4 py-3">
                          <StatusPill status={req.status} />
                        </Link>
                      </td>

                      <td className="w-10 px-2 py-3 border-l border-gray-300 text-center">
                        <div className="inline-flex">
                          <DeleteMessageButton id={req.id} />
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
            <div className="flex items-center justify-between mt-3 text-sm flex-shrink-0">
              <span className="text-gray-400">
                Pagina {page} di {totalPages} · {total} messaggio/i
              </span>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={buildHref({ page: page - 1 })}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium"
                  >
                    ← Precedente
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildHref({ page: page + 1 })}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium"
                  >
                    Successiva →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OriginIcon({ source }: { source: "site" | "email" }) {
  if (source === "email") {
    return (
      <span title="Email (ricevuta via Resend)" className="text-gray-400 flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </span>
    );
  }
  return (
    <span title="Dal sito (modulo)" className="text-green-end/70 flex-shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M3.6 9h16.8 M3.6 15h16.8 M12 3a15 15 0 010 18 M12 3a15 15 0 000 18" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { label: string; cls: string }> = {
    new: { label: "Nuovo", cls: "bg-red-100 text-red-700" },
    read: { label: "Letto", cls: "bg-blue-100 text-blue-700" },
    handled: { label: "Gestito", cls: "bg-gray-100 text-gray-600" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
