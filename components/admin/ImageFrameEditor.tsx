"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Canvas output dimensions ─────────────────────────────────────────────────
// These match the visual ratios: cover = 16:10, gallery = 4:3.
// The canvas is drawn at this resolution, then uploaded & stored.
const DIMS = {
  cover: { w: 1280, h: 800 },
  gallery: { w: 960, h: 720 },
} as const;

interface Props {
  ratio: "cover" | "gallery";
  currentUrl?: string | null;
  onChange: (url: string) => void;
}

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

export default function ImageFrameEditor({ ratio, currentUrl, onChange }: Props) {
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

  // ── Save (crop → upload) ──────────────────────────────────────────────────

  async function handleSave() {
    if (!imgEl) return;
    setUploading(true);
    setError(null);

    try {
      const canvas = canvasRef.current!;
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
  }

  const minScale = imgEl ? coverScale(imgEl) : 0.5;
  const maxScale = imgEl ? coverScale(imgEl) * 3 : 3;

  const hasNewImage = !!imgEl;
  const hasExisting = !imgEl && !!currentUrl;

  return (
    <div className="space-y-3">
      {/* Frame preview */}
      <div
        ref={containerRef}
        className={`w-full relative overflow-hidden rounded-xl border-2 select-none ${
          hasNewImage
            ? "border-green-end " + (dragging ? "cursor-grabbing" : "cursor-grab")
            : hasExisting
            ? "border-gray-200"
            : "border-dashed border-gray-300 bg-gray-50"
        }`}
        style={{ aspectRatio: `${CW} / ${CH}` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {hasNewImage ? (
          /* Canvas (drag-to-crop preview) */
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        ) : hasExisting ? (
          /* Current saved image */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl!}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Nessuna immagine</p>
          </div>
        )}
      </div>

      {/* Zoom + hint (only when editing) */}
      {hasNewImage && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <input
              type="range"
              min={Math.round(minScale * 100)}
              max={Math.round(maxScale * 100)}
              step={1}
              value={Math.round(scale * 100)}
              onChange={(e) => handleZoom(parseInt(e.target.value) / 100)}
              className="flex-1 h-1.5 accent-green-end"
            />
          </div>
          <p className="text-xs text-gray-400">
            Trascina per riposizionare · cursore per zoom ·{" "}
            <strong className="text-amber-600">clicca Salva per confermare prima di salvare il progetto</strong>
          </p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-graphite hover:bg-gray-50 transition-colors"
        >
          {currentUrl || hasNewImage ? "Cambia immagine" : "Seleziona immagine"}
        </button>

        {hasNewImage && (
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading}
            className="px-3 py-1.5 rounded-lg bg-green-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvataggio…
              </>
            ) : (
              "Salva immagine"
            )}
          </button>
        )}

        {saved && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Salvata
          </span>
        )}

        {currentUrl && !hasNewImage && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSaved(false);
            }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Rimuovi
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
