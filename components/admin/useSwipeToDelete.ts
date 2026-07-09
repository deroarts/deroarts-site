"use client";

import { useRef, useState } from "react";

const THRESHOLD = 72; // px oltre cui lo swipe "scatta" e resta aperto
const MAX = 88; // apertura massima (larghezza pannello elimina)

/**
 * Swipe-to-delete stile app mobile: si trascina la card verso sinistra per
 * rivelare l'azione "elimina". Solo touch (mobile) — su desktop non fa nulla.
 *
 * Uso:
 *   const s = useSwipeToDelete(onDelete);
 *   <div {...s.handlers} style={s.style}>…card…</div>
 * e un pannello rosso dietro, largo MAX, con lo stesso onDelete.
 */
export function useSwipeToDelete(onDelete: () => void) {
  const [offset, setOffset] = useState(0); // negativo = scorrimento a sinistra
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startOffset.current = offset;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    // consenti solo trascinamento verso sinistra (offset negativo), con clamp
    const next = Math.max(-MAX, Math.min(0, startOffset.current + dx));
    setOffset(next);
  }

  function onTouchEnd() {
    setDragging(false);
    setOffset(offset <= -THRESHOLD ? -MAX : 0);
  }

  const open = offset <= -THRESHOLD;

  return {
    open,
    panelWidth: MAX,
    reset: () => setOffset(0),
    onDelete,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    style: {
      transform: `translateX(${offset}px)`,
      transition: dragging ? "none" : "transform 0.2s ease",
    } as React.CSSProperties,
  };
}
