import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import { formatDateLong as formatDate } from "@/lib/dates";
import { htmlToPlainText } from "@/lib/sanitize-html";
import type { Prisma } from "@prisma/client";
import MessaggiFilters from "@/components/admin/MessaggiFilters";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";
import MessageCardMobile from "@/components/admin/MessageCardMobile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messaggi | Admin DeroArts" };

// Indirizzo @deroarts.com "a cui" è arrivato il messaggio: quello del progetto
// se impostato, altrimenti la casella di default (RESEND_FROM / info@).
const DEFAULT_MAILBOX = process.env.RESEND_FROM || "info@deroarts.com";
function mailboxFor(project: { from_email: string | null } | null): string {
  return project?.from_email || DEFAULT_MAILBOX;
}

interface PageProps {
  searchParams: {
    projectId?: string;
    q?: string;
  };
}

export default async function MessaggiAdminPage({ searchParams }: PageProps) {
  const projectFilter = searchParams.projectId ?? "";
  const q = (searchParams.q ?? "").trim();

  // La lista mostra solo i messaggi RICEVUTI (inbound): le risposte dell'admin
  // (outbound) vivono dentro la conversazione, non come righe a sé.
  const where: Prisma.RequestWhereInput = { direction: "inbound" };
  if (projectFilter) where.project_id = projectFilter;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  // Carico i messaggi ricevuti (inbound) che matchano i filtri, poi raggruppo
  // per EMAIL utente: tutti i messaggi dello stesso indirizzo = una sola riga
  // (il messaggio più recente rappresenta la conversazione). Volumi free-tier
  // bassi → raggruppamento in JS, semplice e leggibile.
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

  // Raggruppa per email (case-insensitive). L'array è già ordinato per data desc
  // → il primo incontrato è il messaggio più recente di quell'utente.
  // `hasUnread` = esiste almeno un messaggio ancora non letto (status "new") di
  // quell'utente → serve al pallino "nuovi messaggi".
  type Row = (typeof inboundRows)[number];
  const byEmail = new Map<string, { rep: Row; hasUnread: boolean }>();
  for (const r of inboundRows) {
    const key = (r.email || "").trim().toLowerCase();
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, { rep: r, hasUnread: r.status === "new" });
    } else if (r.status === "new") {
      existing.hasUnread = true;
    }
  }
  // Nessuna paginazione: la lista mostra tutte le conversazioni, si scorre.
  const messages = Array.from(byEmail.values());

  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: t(p.title as Record<string, string>),
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-h,4rem))]">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-graphite text-center md:text-left">Messaggi</h1>
      </div>

      {/* Filtri: cerca a sinistra + filtro progetti, su una sola riga */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <MessaggiFilters
          projects={projectOptions}
          currentProjectId={projectFilter}
          currentQuery={q}
        />
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 mt-4">
          <p className="font-medium mb-1">Nessun messaggio</p>
          <p className="text-sm">
            {projectFilter || q
              ? "Nessun messaggio con questi filtri."
              : "Non sono ancora arrivati messaggi."}
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* ── Mobile: card impilate (esperienza nativa) ────────────────── */}
          <ul className="md:hidden overflow-y-auto flex-1 min-h-0 space-y-2.5">
            {messages.map(({ rep, hasUnread }) => (
              <li key={rep.id}>
                <MessageCardMobile
                  id={rep.id}
                  href={`/admina/messaggi/${rep.id}`}
                  unread={hasUnread}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {hasUnread && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-green-end flex-shrink-0 animate-pulse"
                        title="Nuovi messaggi"
                      />
                    )}
                    <span
                      className={`truncate flex-1 ${
                        hasUnread ? "font-semibold text-graphite" : "font-medium text-gray-700"
                      }`}
                    >
                      {rep.name}
                    </span>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(rep.created_at)}
                    </span>
                  </div>
                  {htmlToPlainText(rep.message) && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {htmlToPlainText(rep.message)}
                    </p>
                  )}
                  {rep.project && (
                    <p className="text-xs font-medium text-green-end truncate mt-1">
                      {t(rep.project.title)}
                    </p>
                  )}
                </MessageCardMobile>
              </li>
            ))}
          </ul>

          {/* ── Desktop: tabella (scroll interno, pagina fissa) ──────────── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto flex-1 min-h-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-green-deep border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="w-6 px-1 py-3" />
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Data
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Nome
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden md:table-cell border-l border-white/10">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden lg:table-cell border-l border-white/10">
                    Inviato a
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Progetto
                  </th>
                  <th className="w-10 px-2 py-3 border-l border-white/10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map(({ rep, hasUnread }, i) => (
                  <tr
                    key={rep.id}
                    className={`transition-colors hover:bg-green-end/5 ${
                      i % 2 === 1 ? "bg-gray-100" : "bg-white"
                    } ${hasUnread ? "font-semibold text-graphite" : "text-gray-700"}`}
                  >
                    {/* Pallino "nuovi messaggi" — verde lampeggiante */}
                    <td className="px-1 py-1.5">
                      {hasUnread && (
                        <span
                          className="block w-2.5 h-2.5 rounded-full bg-green-end mx-auto animate-pulse"
                          title="Nuovi messaggi da questo utente"
                        />
                      )}
                    </td>

                    <td className="px-0 py-0 border-l border-gray-300">
                      <Link
                        href={`/admina/messaggi/${rep.id}`}
                        className="block px-4 py-1.5 text-xs text-gray-600 whitespace-nowrap text-center hover:text-graphite"
                      >
                        {formatDate(rep.created_at)}
                      </Link>
                    </td>

                    <td className="px-0 py-0 border-l border-gray-300 text-center">
                      <Link
                        href={`/admina/messaggi/${rep.id}`}
                        className="block px-4 py-1.5 hover:text-green-end transition-colors"
                      >
                        {rep.name}
                      </Link>
                    </td>

                    <td className="px-0 py-0 hidden md:table-cell border-l border-gray-300 text-center text-sm">
                      <Link href={`/admina/messaggi/${rep.id}`} className="block px-4 py-1.5 hover:text-green-end transition-colors">
                        {rep.email}
                      </Link>
                    </td>

                    <td className="px-0 py-0 hidden lg:table-cell border-l border-gray-300 text-center text-sm">
                      <Link href={`/admina/messaggi/${rep.id}`} className="block px-4 py-1.5">
                        {mailboxFor(rep.project)}
                      </Link>
                    </td>

                    <td className="px-0 py-0 border-l border-gray-300 text-center">
                      <Link href={`/admina/messaggi/${rep.id}`} className="block px-4 py-1.5">
                        {rep.project ? (
                          <span className="text-xs font-medium text-green-end">
                            {t(rep.project.title)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </Link>
                    </td>

                    <td className="w-10 px-2 py-1.5 border-l border-gray-300 text-center">
                      <div className="inline-flex">
                        <DeleteMessageButton id={rep.id} />
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

