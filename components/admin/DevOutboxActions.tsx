"use client";

import { useTransition } from "react";
import {
  deleteDevOutboxAction,
  clearDevOutboxAction,
} from "@/app/admina/(shell)/dev-outbox/actions";

/** Cestino su una singola card (non apre/chiude il pannello details). */
export function DeleteDevOutboxButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(() => deleteDevOutboxAction(id));
      }}
      title="Elimina questa email"
      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 p-2.5 -m-1.5"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

/** Pulsante "Svuota tutto" con conferma. */
export function ClearDevOutboxButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Svuotare tutte le email finte della Dev Outbox?")) {
          start(() => clearDevOutboxAction());
        }
      }}
      className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-red-500 hover:border-red-300 transition-colors disabled:opacity-40"
    >
      {pending ? "Svuoto…" : "Svuota tutto"}
    </button>
  );
}
