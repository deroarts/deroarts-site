"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createRequestAction } from "@/app/actions/requests";

interface RequestFormProps {
  /** DB project ID to link the request (omit for general contact). */
  projectId?: string;
  /** Shown in success message. */
  projectTitle?: string;
  /** Compact mode for use inside a modal. */
  compact?: boolean;
  /** Called after user dismisses the success screen (modal use). */
  onSuccess?: () => void;
}

function SubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 ${
        compact ? "py-2.5 text-sm" : "py-3"
      }`}
    >
      {pending ? "Invio in corso…" : "Invia richiesta"}
    </button>
  );
}

export default function RequestForm({
  projectId,
  projectTitle,
  compact = false,
  onSuccess,
}: RequestFormProps) {
  const [state, action] = useFormState(createRequestAction, {
    ok: false,
    error: null,
    fieldErrors: {},
  });

  const inputClass = compact
    ? "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
    : "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition bg-white";

  if (state.ok) {
    return (
      <div className={`text-center ${compact ? "py-6" : "py-12"}`}>
        <div
          className={`rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 ${
            compact ? "w-12 h-12" : "w-16 h-16"
          }`}
        >
          <svg
            className={`text-emerald-600 ${compact ? "w-6 h-6" : "w-8 h-8"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3
          className={`font-bold text-graphite mb-2 ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          {compact ? "Richiesta inviata!" : "Messaggio inviato!"}
        </h3>
        <p className="text-gray-500 text-sm">
          {compact
            ? "Ti risponderemo il prima possibile."
            : "Grazie per averci contattato. Ti risponderemo il prima possibile."}
        </p>
        {compact && onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="mt-5 px-5 py-2 rounded-lg bg-green-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Chiudi
          </button>
        )}
      </div>
    );
  }

  return (
    <form action={action} className={compact ? "space-y-4" : "space-y-5"}>
      {/* Hidden project binding */}
      {projectId && <input type="hidden" name="projectId" value={projectId} />}

      {/* Global error */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Nome e cognome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          className={inputClass}
          placeholder="Il tuo nome"
        />
        {state.fieldErrors.name && (
          <p className="text-red-500 text-xs mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="la.tua@email.it"
        />
        {state.fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Messaggio <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={compact ? 4 : 5}
          className={`${inputClass} resize-none`}
          placeholder={
            compact ? "Cosa vorresti sapere?" : "Descrivi la tua richiesta o il tuo progetto…"
          }
        />
        {state.fieldErrors.message && (
          <p className="text-red-500 text-xs mt-1">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      <SubmitButton compact={compact} />
    </form>
  );
}
