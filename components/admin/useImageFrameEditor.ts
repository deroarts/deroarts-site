"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Canvas output dimensions ─────────────────────────────────────────────────
// These match the visual ratios: cover = 16:10, gallery = 4:3.
// The canvas is drawn at this resolution, then uploaded & stored.
export const DIMS = {
  cover: { w: 1280, h: 800 },
  gallery: { w: 960, h: 720 },
} as const;

export type FrameRatio = "cover" | "gallery";

function clampOffset(
  ox: number,
  oy: number,
  imgW: number,
  imgH: number,
  sc: number,
  cw: number,
  ch: number
) {
  const w = imgW * sc;
  const h = imgH * sc;
  return {
    x: Math.min(0, Math.max(cw - w, ox)),
    y: Math.min(0, Math.max(ch - h, oy)),
  };
}

/**
 * Logica dell'editor immagine (canvas crop + drag/zoom + upload automatico).
 * L'immagine viene caricata e propagata al form da sola: ogni volta che si
 * carica un file o si cambia inquadratura (drag/zoom) parte un upload
 * "ritardato" (debounce) così da non chiamare l'API a ogni micro-movimento.
 */
export function useImageFrameEditor(
  ratio: FrameRatio,
  onChange: (url: string) => void
) {
  const { w: CW, h: CH } = DIMS[ratio];

  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ cx: 0, cy: 0, ox: 0, oy: 0 });
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute the fit-to-cover scale so the image always fills the frame
  const coverScale = useCallback(
    (img: HTMLImageElement) => Math.max(CW / img.width, CH / img.height),
    [CW, CH]
  );

  // Draw canvas preview whenever imgEl, scale or offset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(imgEl, offset.x, offset.y, imgEl.width * scale, imgEl.height * scale);
  }, [imgEl, scale, offset, CW, CH]);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Seleziona un'immagine valida (JPEG, PNG, WebP).");
      return;
    }
    setError(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const sc = coverScale(img);
        const clamped = clampOffset(
          (CW - img.width * sc) / 2,
          (CH - img.height * sc) / 2,
          img.width,
          img.height,
          sc,
          CW,
          CH
        );
        setImgEl(img);
        setScale(sc);
        setOffset(clamped);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    // Reset so same file can be picked again
    e.target.value = "";
  }

  // ── Drag ──────────────────────────────────────────────────────────────────

  function getPixelRatio(): number {
    const w = containerRef.current?.offsetWidth ?? CW;
    return CW / w;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!imgEl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragStart({ cx: e.clientX, cy: e.clientY, ox: offset.x, oy: offset.y });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !imgEl) return;
    const pr = getPixelRatio();
    const dx = (e.clientX - dragStart.cx) * pr;
    const dy = (e.clientY - dragStart.cy) * pr;
    const clamped = clampOffset(
      dragStart.ox + dx,
      dragStart.oy + dy,
      imgEl.width,
      imgEl.height,
      scale,
      CW,
      CH
    );
    setOffset(clamped);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────

  function handleZoom(newScale: number) {
    if (!imgEl) return;
    // Keep the visible center fixed while zooming
    const cx = -offset.x + CW / 2;
    const cy = -offset.y + CH / 2;
    const ratio_ = newScale / scale;
    const clamped = clampOffset(
      offset.x - cx * (ratio_ - 1),
      offset.y - cy * (ratio_ - 1),
      imgEl.width,
      imgEl.height,
      newScale,
      CW,
      CH
    );
    setScale(newScale);
    setOffset(clamped);
  }

  // ── Save (crop → upload), automatico ──────────────────────────────────────

  const doUpload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;
    setUploading(true);
    setError(null);

    try {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, CW, CH);
      ctx.drawImage(imgEl, offset.x, offset.y, imgEl.width * scale, imgEl.height * scale);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Creazione blob fallita"))),
          "image/jpeg",
          0.88
        )
      );

      const fd = new FormData();
      fd.append("file", blob, `frame-${Date.now()}.jpg`);
      fd.append("purpose", ratio === "cover" ? "cover" : "gallery");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Upload fallito" }));
        throw new Error(body.error ?? "Upload fallito");
      }
      const { url } = await res.json();
      onChange(url);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il salvataggio.");
    } finally {
      setUploading(false);
    }
  }, [imgEl, offset, scale, CW, CH, ratio, onChange]);

  // Programma un upload ritardato: si azzera a ogni nuova modifica, così parte
  // solo quando l'utente ha finito di trascinare/zoomare (o subito dopo il load).
  const scheduleUpload = useCallback(
    (delay: number) => {
      if (uploadTimer.current) clearTimeout(uploadTimer.current);
      setSaved(false);
      uploadTimer.current = setTimeout(() => {
        void doUpload();
      }, delay);
    },
    [doUpload]
  );

  // Upload automatico quando cambia immagine o inquadratura.
  useEffect(() => {
    if (!imgEl) return;
    scheduleUpload(600);
    return () => {
      if (uploadTimer.current) clearTimeout(uploadTimer.current);
    };
  }, [imgEl, scale, offset, scheduleUpload]);

  const minScale = imgEl ? coverScale(imgEl) : 0.5;
  const maxScale = imgEl ? coverScale(imgEl) * 3 : 3;
  const hasNewImage = !!imgEl;

  return {
    CW,
    CH,
    scale,
    dragging,
    uploading,
    saved,
    error,
    minScale,
    maxScale,
    hasNewImage,
    fileRef,
    canvasRef,
    containerRef,
    setSaved,
    handleFileChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleZoom,
  };
}
