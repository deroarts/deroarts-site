"use client";

import Link from "next/link";

interface Props {
  /** Testo del titolo (es. "Modifica Stickers" o "Nuovo progetto"). */
  heading: string;
  /** Etichetta del pulsante di submit. */
  submitLabel: string;
  /** id del <form> a cui il pulsante Salva è collegato (attributo HTML `form`). */
  formId: string;
  /** True mentre il salvataggio è in corso. */
  pending: boolean;
  /** URL di anteprima pubblica (solo in modifica). */
  previewUrl?: string;
  /** True se l'anteprima usa un token firmato (progetto non pubblicato) → badge "1h". */
  previewIsSigned?: boolean;
}

/**
 * Riga sticky in cima alla pagina di modifica/creazione progetto:
 * freccia indietro + titolo a sinistra, Anteprima (bianco) + Salva a destra.
 * Sta FUORI dal form (per restare fissa mentre il form scorre); il pulsante
 * Salva invia comunque il form tramite l'attributo HTML `form={formId}`.
 */
export default function ProjectFormHeader({
  heading,
  submitLabel,
  formId,
  pending,
  previewUrl,
  previewIsSigned,
}: Props) {
  return (
    <div className="md:sticky md:top-0 z-20 -mx-4 -mt-4 px-4 md:-mx-6 md:-mt-6 md:px-6 py-4 mb-6 bg-light-surface/95 md:backdrop-blur border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 max-w-3xl">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admina/progetti"
            className="text-gray-400 hover:text-graphite transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-graphite truncate">{heading}</h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-green-deep hover:border-green-deep transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Anteprima
              {previewIsSigned && (
                <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-mono leading-none">
                  1h
                </span>
              )}
            </a>
          )}
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className="px-6 py-2 rounded-xl border border-transparent bg-green-deep text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? "Salvataggio…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
