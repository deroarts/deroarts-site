"use client";

import { useState, useTransition } from "react";
import { t } from "@/lib/i18n";
import {
  createCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
} from "./actions";

interface Category {
  id: string;
  name: unknown;
  sort_order: number;
  _count: { projects: number };
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
        setDeleteError(e instanceof Error ? e.message : "Errore durante l'eliminazione.");
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
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Nessuna categoria. Aggiungine una sopra.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3"
              >
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
                    <span className="text-xs text-gray-400 mr-2">
                      {cat._count.projects} progetto/i
                    </span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs text-gray-400 hover:text-green-end transition-colors px-2 py-1"
                    >
                      Rinomina
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat._count.projects)}
                      disabled={isPending}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
                    >
                      Elimina
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
