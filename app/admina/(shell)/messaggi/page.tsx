import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import type { RequestStatus, Prisma } from "@prisma/client";
import MessaggiFilters from "@/components/admin/MessaggiFilters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messaggi | Admin DeroArts" };

const PAGE_SIZE = 20;

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
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MessaggiAdminPage({ searchParams }: PageProps) {
  const statusFilter = (searchParams.status ?? "") as RequestStatus | "";
  const projectFilter = searchParams.projectId ?? "";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  // Build the where clause from all active filters.
  const where: Prisma.RequestWhereInput = {};
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

  const [total, newCount, readCount, handledCount, messages, projects] =
    await Promise.all([
      prisma.request.count({ where }),
      prisma.request.count({ where: { status: "new" } }),
      prisma.request.count({ where: { status: "read" } }),
      prisma.request.count({ where: { status: "handled" } }),
      prisma.request.findMany({
        where,
        include: { project: { select: { slug: true, title: true } } },
        orderBy: { created_at: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.project.findMany({
        select: { id: true, title: true },
        orderBy: { sort_order: "asc" },
      }),
    ]);

  const allCount = newCount + readCount + handledCount;
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">Messaggi</h1>
      </div>

      {/* Filter tabs (status) */}
      <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {TAB_OPTIONS.map((tab) => {
          const active = statusFilter === tab.value;
          const isNew = tab.value === "new" && tabCounts[tab.value] > 0;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value || undefined, page: undefined })}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                active
                  ? "bg-white text-graphite shadow-sm"
                  : "text-gray-500 hover:text-graphite"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isNew
                    ? "bg-red-100 text-red-700"
                    : active
                    ? "bg-gray-100 text-gray-500"
                    : "bg-white/50 text-gray-400"
                }`}
              >
                {tabCounts[tab.value]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Project filter + search (client component for instant UX) */}
      <MessaggiFilters
        projects={projectOptions}
        currentProjectId={projectFilter}
        currentQuery={q}
        currentStatus={statusFilter}
      />

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
        <>
          {/* ── Mobile: card impilate (esperienza nativa) ────────────────── */}
          <ul className="md:hidden mt-4 space-y-2.5">
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
                    <p className="text-xs text-gray-400 truncate mb-2">
                      {req.email}
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

          {/* ── Desktop: tabella ─────────────────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto mt-4">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-green-deep border-b border-gray-200">
                <tr>
                  <th className="w-3 px-1 py-3" />
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Data
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Progetto
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Nome
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider hidden md:table-cell border-l border-white/10">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider border-l border-white/10">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
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

                      <td className="px-0 py-0 border-l border-gray-100">
                        <Link
                          href={`/admina/messaggi/${req.id}`}
                          className="block px-4 py-3 text-xs text-gray-400 whitespace-nowrap text-center hover:text-graphite"
                        >
                          {formatDate(req.created_at)}
                        </Link>
                      </td>

                      <td className="px-4 py-3 border-l border-gray-100 text-center">
                        {req.project ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-end/10 text-green-end">
                            {t(req.project.title)}
                          </span>
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            Generale
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 border-l border-gray-100 text-center">
                        <Link
                          href={`/admina/messaggi/${req.id}`}
                          className={`hover:text-green-end transition-colors ${
                            isNew
                              ? "font-semibold text-graphite"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {req.name}
                        </Link>
                        {req.replied_at && (
                          <span
                            className="ml-1.5 text-green-end"
                            title="Hai risposto"
                          >
                            ↩
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell border-l border-gray-100 text-center text-sm text-gray-500">
                        <a
                          href={`mailto:${req.email}`}
                          className="hover:text-green-end transition-colors"
                        >
                          {req.email}
                        </a>
                      </td>

                      <td className="px-4 py-3 border-l border-gray-100 text-center">
                        <StatusPill status={req.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
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
        </>
      )}
    </div>
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
