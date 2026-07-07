"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectOption {
  id: string;
  label: string;
}

interface Props {
  projects: ProjectOption[];
  currentProjectId: string;
  currentQuery: string;
}

export default function MessaggiFilters({
  projects,
  currentProjectId,
  currentQuery,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery);

  // Build a URL from the current filter set, resetting pagination.
  function navigate(next: { projectId?: string; q?: string }) {
    const p = new URLSearchParams();
    const projectId =
      next.projectId !== undefined ? next.projectId : currentProjectId;
    const q = next.q !== undefined ? next.q : query;
    if (projectId) p.set("projectId", projectId);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    router.push(`/admina/messaggi${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Search — prima posizione, a sinistra */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: query });
        }}
        className="relative w-full sm:max-w-xs"
      >
        <svg
          className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca nome, email, testo…"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-graphite placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-end/30 focus:border-green-end/40 transition-shadow"
        />
      </form>

      {/* Reset / aggiorna: azzera cerca + filtri e ricarica la lista */}
      <button
        type="button"
        onClick={() => {
          setQuery("");
          router.push("/admina/messaggi");
        }}
        title="Azzera filtri e aggiorna"
        aria-label="Azzera filtri e aggiorna"
        className="flex-shrink-0 p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-graphite hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Spazio flessibile → spinge il filtro progetti a destra */}
      <div className="flex-1" />

      {/* Project filter — allineato a destra con la tabella */}
      <div className="relative flex-shrink-0">
        <select
          value={currentProjectId}
          onChange={(e) => navigate({ projectId: e.target.value })}
          className="appearance-none w-40 sm:w-56 pl-3 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-green-end/30 focus:border-green-end/40 transition-shadow"
        >
          <option value="">Tutti i progetti</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <svg
          className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
