"use client";

import { useState } from "react";

/**
 * Pulsante icona (senza testo né contorno) che copia l'intera conversazione
 * negli appunti, in un formato testuale leggibile e analizzabile altrove.
 */
export default function CopyChatButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: selezione via textarea temporanea (browser senza clipboard API).
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copiato!" : "Copia tutta la conversazione"}
      aria-label="Copia tutta la conversazione"
      className={`p-1.5 rounded-lg transition-colors ${
        copied ? "text-green-end" : "text-gray-400 hover:text-graphite"
      }`}
    >
      {copied ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
