import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { t } from "@/lib/i18n";
import type { RequestStatus } from "@prisma/client";

export const metadata = { title: "Richieste | Admin DeroArts" };

const PAGE_SIZE = 20;

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

const TAB_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Tutte", value: "" },
  { label: "Nuove", value: "new" },
  { label: "Lette", value: "read" },
  { label: "Gestite", value: "handled" },
];

interface PageProps {
  searchParams: { status?: string; page?: string };
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

export default async function RichiesteAdminPage({ searchParams }: PageProps) {
  const statusFilter = (searchParams.status ?? "") as RequestStatus | "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where =
    statusFilter && ["new", "read", "handled"].includes(statusFilter)
      ? { status: statusFilter as RequestStatus }
      : {};

  // Counts for tabs
  const [total, newCount, readCount, handledCount, requests] =
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
    ]);

  const allCount = newCount + readCount + handledCount;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabCounts: Record<string, number> = {
    "": allCount,
    new: newCount,
    read: readCount,
    handled: handledCount,
  };

  function tabHref(value: string) {
    const p = new URLSearchParams();
    if (value) p.set("status", value);
    const q = p.toString();
    return `/admina/richieste${q ? `?${q}` : ""}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return `/admina/richieste${q ? `?${q}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Richieste</h1>
          <p className="text-xs text-gray-400 mt-0.5">{allCount} richiesta/e totali</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {TAB_OPTIONS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                active
                  ? "bg-white text-graphite shadow-sm"
                  : "text-gray-500 hover:text-graphite"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active
                    ? tab.value === "new" && tabCounts[tab.value] > 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-500"
                    : tab.value === "new" && tabCounts[tab.value] > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-white/50 text-gray-400"
                }`}
              >
                {tabCounts[tab.value]}
              </span>
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="font-medium mb-1">Nessuna richiesta</p>
          <p className="text-sm">
            {statusFilter
              ? "Nessuna richiesta con questo stato."
              : "Non sono ancora arrivate richieste."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Progetto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">
                      {req.project ? (
                        <Link
                          href={`/progetti/${req.project.slug}`}
                          target="_blank"
                          className="hover:text-green-end transition-colors"
                        >
                          {t(req.project.title)}
                        </Link>
                      ) : (
                        <span className="italic text-gray-400">Generale</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-graphite">
                      {req.name}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                      <a
                        href={`mailto:${req.email}`}
                        className="hover:text-green-end transition-colors"
                      >
                        {req.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE_CLASSES[req.status]
                        }`}
                      >
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admina/richieste/${req.id}`}
                        className="text-gray-400 hover:text-green-end transition-colors"
                        title="Apri"
                      >
                        <svg
                          className="w-4 h-4"
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
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-400">
                Pagina {page} di {totalPages} · {total} risultato/i
              </span>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium"
                  >
                    ← Precedente
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium"
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
