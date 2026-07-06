"use client";

import { useState } from "react";
import { ACTION_LABELS } from "@/lib/i18n";
import RequestForm from "./RequestForm";

interface ProjectAction {
  id: string;
  type: string;
  label: unknown;
  url: string | null;
  enabled: boolean;
}

interface ActionButtonsProps {
  actions: ProjectAction[];
  projectId: string;
  projectTitle: string;
}

function getLabel(action: ProjectAction): string {
  const field = action.label as Record<string, string> | null;
  if (field?.it) return field.it;
  return ACTION_LABELS[action.type] ?? action.type;
}

export default function ActionButtons({
  actions,
  projectId,
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
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
          projectId={projectId}
          projectTitle={projectTitle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

function RequestInfoModal({
  projectId,
  projectTitle,
  onClose,
}: {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
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
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-white/70 text-sm mt-1">{projectTitle}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <RequestForm
            projectId={projectId}
            projectTitle={projectTitle}
            compact
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}
