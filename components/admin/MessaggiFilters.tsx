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
  currentStatus: string;
}

export default function MessaggiFilters({
  projects,
  currentProjectId,
  currentQuery,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery);

  // Build a URL from the current filter set, resetting pagination.
  function navigate(next: { projectId?: string; q?: string }) {
    const p = new URLSearchParams();
    if (currentStatus) p.set("status", currentStatus);
    const projectId =
      next.projectId !== undefined ? next.projectId : currentProjectId;
    const q = next.q !== undefined ? next.q : query;
    if (projectId) p.set("projectId", projectId);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    router.push(`/admina/messaggi${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      {/* Project filter */}
      <div className="relative">
        <select
          value={currentProjectId}
          onChange={(e) => navigate({ projectId: e.target.value })}
          className="appearance-none w-full sm:w-56 pl-3 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-green-end/30 focus:border-green-end/40 transition-shadow"
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

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: query });
        }}
        className="relative flex-1 sm:max-w-xs"
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
    </div>
  );
}
