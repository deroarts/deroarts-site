"use client";

import { useState, useTransition } from "react";
import { t } from "@/lib/i18n";
import {
  createCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
} from "./actions";

interface Category {
  id: string;
  name: unknown;
  sort_order: number;
  _count: { projects: number };
}

function SortButton({
  onClick,
  disabled,
  dir,
}: {
  onClick: () => void;
  disabled: boolean;
  dir: "up" | "down";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-gray-300 hover:text-graphite disabled:opacity-20 transition-colors leading-none"
      title={dir === "up" ? "Sposta su" : "Sposta giù"}
    >
      {dir === "up" ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}

export default function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(t(cat.name));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  function submitRename(id: string) {
    const fd = new FormData();
    fd.set("name", editValue);
    startTransition(async () => {
      await renameCategoryAction(id, fd);
      setEditingId(null);
    });
  }

  function handleMove(id: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveCategoryAction(id, dir);
    });
  }

  async function handleDelete(id: string, projectCount: number) {
    if (projectCount > 0) {
      setDeleteError(
        `Impossibile eliminare: ${projectCount} progetto/i usa questa categoria.`
      );
      return;
    }
    if (!confirm("Eliminare questa categoria?")) return;
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
      } catch (e: unknown) {
        setDeleteError(
          e instanceof Error ? e.message : "Errore durante l'eliminazione."
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <form
        action={createCategoryAction}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
      >
        <p className="text-sm font-medium text-graphite mb-3">
          Aggiungi categoria
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            name="name"
            required
            placeholder="Nome categoria"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-green-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Aggiungi
          </button>
        </div>
      </form>

      {deleteError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
          {deleteError}
          <button
            onClick={() => setDeleteError(null)}
            className="ml-2 underline text-xs"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Nessuna categoria. Aggiungine una sopra.
          </p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="w-6" />
              <span className="flex-1">Nome</span>
              <span className="w-14 text-center">Ordine</span>
              <span className="w-20 text-center">Progetti</span>
              <span className="w-28" />
            </div>
            <ul className="divide-y divide-gray-50">
              {categories.map((cat, idx) => (
                <li
                  key={cat.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isPending ? "opacity-50" : ""
                  }`}
                >
                  {/* Sort arrows */}
                  <div className="flex flex-col gap-0.5 w-6 flex-shrink-0">
                    <SortButton
                      dir="up"
                      onClick={() => handleMove(cat.id, "up")}
                      disabled={isPending || idx === 0}
                    />
                    <SortButton
                      dir="down"
                      onClick={() => handleMove(cat.id, "down")}
                      disabled={isPending || idx === categories.length - 1}
                    />
                  </div>

                  {editingId === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-end"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRename(cat.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => submitRename(cat.id)}
                        disabled={isPending}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-gradient text-white font-medium hover:opacity-90"
                      >
                        Salva
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-graphite text-sm">
                        {t(cat.name)}
                      </span>
                      <span className="w-14 text-center text-xs font-mono text-gray-400 bg-gray-50 rounded px-1.5 py-0.5">
                        {cat.sort_order}
                      </span>
                      <span className="w-20 text-center text-xs text-gray-400">
                        {cat._count.projects}
                      </span>
                      <div className="w-28 flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-xs text-gray-400 hover:text-green-end transition-colors px-2 py-1 rounded hover:bg-gray-50"
                        >
                          Rinomina
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cat.id, cat._count.projects)
                          }
                          disabled={isPending}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                        >
                          Elimina
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
