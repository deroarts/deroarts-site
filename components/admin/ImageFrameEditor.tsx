"use client";

import { useImageFrameEditor, type FrameRatio } from "./useImageFrameEditor";

interface Props {
  ratio: FrameRatio;
  currentUrl?: string | null;
  onChange: (url: string) => void;
}

export default function ImageFrameEditor({ ratio, currentUrl, onChange }: Props) {
  const {
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
  } = useImageFrameEditor(ratio, onChange);

  const hasExisting = !hasNewImage && !!currentUrl;

  return (
    <div className="space-y-3">
      {/* Frame preview */}
      <div
        ref={containerRef}
        className={`w-full relative overflow-hidden rounded-xl border-2 select-none touch-none ${
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
            <strong className="text-emerald-600">salvataggio automatico</strong>
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

        {uploading && (
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Salvataggio…
          </span>
        )}

        {saved && !uploading && (
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
