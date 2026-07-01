"use client";

import { useState } from "react";
import { ACTION_LABELS } from "@/lib/i18n";

interface ProjectAction {
  id: string;
  type: string;
  label: unknown;
  url: string | null;
  enabled: boolean;
}

interface ActionButtonsProps {
  actions: ProjectAction[];
  projectSlug: string;
  projectTitle: string;
}

function getLabel(action: ProjectAction): string {
  const field = action.label as Record<string, string> | null;
  if (field?.it) return field.it;
  return ACTION_LABELS[action.type] ?? action.type;
}

export default function ActionButtons({
  actions,
  projectSlug,
  projectTitle,
}: ActionButtonsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const enabled = actions.filter((a) => a.enabled);

  if (enabled.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {enabled.map((action) => {
          if (action.type === "request_info") {
            return (
              <button
                key={action.id}
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded-xl border-2 border-green-end text-green-end font-semibold hover:bg-green-end hover:text-white transition-colors duration-200"
              >
                {getLabel(action)}
              </button>
            );
          }

          if (action.url) {
            return (
              <a
                key={action.id}
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity duration-200 inline-flex items-center gap-2"
              >
                {getLabel(action)}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            );
          }

          return null;
        })}
      </div>

      {/* Request info modal */}
      {modalOpen && (
        <RequestInfoModal
          projectSlug={projectSlug}
          projectTitle={projectTitle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

function RequestInfoModal({
  projectTitle,
  onClose,
}: {
  projectSlug: string;
  projectTitle: string;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Stub — full wiring in Module 4
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-dark-green-gradient px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">
              Richiedi informazioni
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Chiudi"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/70 text-sm mt-1">{projectTitle}</p>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-graphite text-lg mb-2">
                Richiesta inviata!
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Ti risponderemo il prima possibile.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-green-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Chiudi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Nome e cognome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
                  placeholder="la.tua@email.it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Messaggio <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition resize-none"
                  placeholder="Cosa vorresti sapere?"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-green-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Invio in corso…" : "Invia richiesta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
