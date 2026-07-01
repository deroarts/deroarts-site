"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-light-surface flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-graphite mb-3">
          Qualcosa è andato storto
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Si è verificato un errore inaspettato. Puoi riprovare oppure tornare
          alla pagina principale.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Riprova
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl border border-gray-200 text-graphite font-semibold hover:bg-gray-50 transition-colors"
          >
            Torna alla home
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-300 font-mono">
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
