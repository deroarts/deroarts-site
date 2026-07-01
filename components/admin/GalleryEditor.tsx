"use client";

import { useState, useRef } from "react";
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  function addItem() {
    onChange([...items, { url: "", alt_it: "" }]);
  }

  function updateItem(i: number, patch: Partial<GalleryItem>) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function handleDragStart(i: number) {
    dragItem.current = i;
    setDragIndex(i);
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIndex(i);
  }

  function handleDrop(i: number) {
    const from = dragItem.current;
    if (from === null || from === i) return;
    const arr = [...items];
    const [moved] = arr.splice(from, 1);
    arr.splice(i, 0, moved);
    onChange(arr);
    dragItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    dragItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-xs text-gray-400">Nessuna immagine in galleria.</p>
      )}

      {items.map((item, i) => {
        const isDragging = dragIndex === i;
        const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
        return (
          <div
            key={i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={[
              "border rounded-xl p-4 space-y-3 transition-all duration-150",
              isDragging
                ? "opacity-40 border-green-end shadow-none"
                : isOver
                ? "border-green-end ring-2 ring-green-end/30 bg-green-end/5"
                : "border-gray-100",
            ].join(" ")}
          >
            {/* Item header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <span
                  className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors select-none"
                  title="Trascina per riordinare"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Immagine {i + 1}
                </span>
              </div>
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
        );
      })}

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
