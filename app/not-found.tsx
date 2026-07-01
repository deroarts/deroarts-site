import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagina non trovata | DeroArts",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light-surface flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        {/* 404 number */}
        <p className="text-8xl font-bold text-gradient-green mb-4 leading-none select-none">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-graphite mb-3">
          Pagina non trovata
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          La pagina che stai cercando non esiste o è stata spostata.
          Torna alla home o esplora i nostri progetti.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-green-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Torna alla home
          </Link>
          <Link
            href="/progetti"
            className="px-6 py-3 rounded-xl border border-gray-200 text-graphite font-semibold hover:bg-gray-50 transition-colors"
          >
            Vedi i progetti
          </Link>
        </div>
      </div>
    </div>
  );
}
