"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Minimal, non-invasive privacy notice. The site uses no profiling/third-party
// cookies, so this is an informational acknowledgement — the choice is stored
// locally (localStorage), not in a cookie or the DB.
const KEY = "deroarts_privacy_ack";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable → don't block the page */
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Avviso privacy"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-[9998] rounded-xl bg-graphite text-gray-200 shadow-lg border border-white/10 p-4 text-sm"
    >
      <p className="leading-relaxed">
        Usiamo solo dati tecnici essenziali e nessun cookie di tracciamento.
        Dettagli nella{" "}
        <Link href="/privacy" className="underline text-white">
          informativa privacy
        </Link>
        .
      </p>
      <button
        onClick={dismiss}
        className="mt-3 w-full rounded-lg bg-green-gradient text-white font-medium py-2 hover:opacity-90 transition-opacity"
      >
        Ho capito
      </button>
    </div>
  );
}
