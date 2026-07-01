"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Stub — full wiring in Module 4
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-graphite mb-2">Messaggio inviato!</h3>
        <p className="text-gray-500">
          Grazie per averci contattato. Ti risponderemo il prima possibile.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Nome e cognome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition bg-white"
          placeholder="Il tuo nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition bg-white"
          placeholder="la.tua@email.it"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Messaggio <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition resize-none bg-white"
          placeholder="Come possiamo aiutarti?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? "Invio in corso…" : "Invia messaggio"}
      </button>
    </form>
  );
}
