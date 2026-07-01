"use client";

import ImageFrameEditor from "./ImageFrameEditor";

export interface GalleryItem {
  url: string;
  alt_it: string;
}

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

export default function GalleryEditor({ items, onChange }: GalleryEditorProps) {
  function addItem() {
    onChange([...items, { url: "", alt_it: "" }]);
  }

  function updateItem(i: number, patch: Partial<GalleryItem>) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-xs text-gray-400">Nessuna immagine in galleria.</p>
      )}

      {items.map((item, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
          {/* Item header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Immagine {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors"
                title="Sposta su"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveItem(i, 1)}
                disabled={i === items.length - 1}
                className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors"
                title="Sposta giù"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Rimuovi immagine"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Frame editor (4:3) */}
          <ImageFrameEditor
            ratio="gallery"
            currentUrl={item.url || null}
            onChange={(url) => updateItem(i, { url })}
          />

          {/* Alt text */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Testo alternativo (italiano)
            </label>
            <input
              type="text"
              value={item.alt_it}
              onChange={(e) => updateItem(i, { alt_it: e.target.value })}
              placeholder="Descrizione dell'immagine per l'accessibilità"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end"
            />
          </div>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm font-medium text-green-end hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Aggiungi immagine
      </button>
    </div>
  );
}
