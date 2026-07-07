"use client";

import { deleteRequestAction } from "@/app/admina/(shell)/messaggi/actions";

export default function DeleteMessageButton({ id }: { id: string }) {
  return (
    <form
      action={deleteRequestAction.bind(null, id)}
      onSubmit={(e) => {
        if (
          !confirm(
            "Eliminare definitivamente questo messaggio? L'azione non è reversibile."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        title="Elimina"
        aria-label="Elimina"
        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  );
}
