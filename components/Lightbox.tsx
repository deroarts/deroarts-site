"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GalleryImage } from "@/components/ProjectGallery";

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const ARROW_BTN =
  "absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

// Visore a schermo intero. L'immagine è mostrata alla sua misura reale e mai
// ingrandita oltre (così resta nitida); su schermi piccoli si riduce per stare
// tutta. Esc chiude, frecce/scorrimento cambiano immagine.
export default function Lightbox({ images, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const image = images[index];

  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + count) % count),
    [index, count, onIndexChange]
  );

  // Apertura: blocca lo scorrimento della pagina e porta il focus su "Chiudi";
  // alla chiusura il focus torna alla miniatura da cui si era partiti.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  // Tastiera: Esc chiude, frecce cambiano immagine, Tab resta dentro il visore.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) go(1);
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
      else if (e.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose, count]);

  // Precarica le immagini vicine: il passaggio all'immagine dopo è immediato.
  useEffect(() => {
    if (count < 2) return;
    for (const d of [1, -1]) {
      const preload = new window.Image();
      preload.src = images[(index + d + count) % count].url;
    }
  }, [index, count, images]);

  const step = (delta: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    go(delta);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={count > 1 ? `Immagine ${index + 1} di ${count}` : "Immagine"}
      className="fixed inset-0 z-[9999] flex flex-col bg-black"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="pt-safe shrink-0">
        <div className="h-16 px-4 flex items-center justify-between text-sm text-white/70">
          <span aria-live="polite">{count > 1 ? `${index + 1} / ${count}` : ""}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="-mr-2 w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-20">
        {/* <img> e non next/image: serve la misura naturale del file (niente
            ingrandimenti) e le immagini arrivano già compresse dallo storage. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={step(-1)} aria-label="Immagine precedente" className={`${ARROW_BTN} left-2 sm:left-4`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" onClick={step(1)} aria-label="Immagine successiva" className={`${ARROW_BTN} right-2 sm:right-4`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Spazio in basso pari alla barra in alto: l'immagine resta centrata.
          Niente didascalia: le immagini dei progetti hanno già il loro titolo. */}
      <div className="pb-safe shrink-0 h-16" aria-hidden="true" />
    </div>
  );
}
