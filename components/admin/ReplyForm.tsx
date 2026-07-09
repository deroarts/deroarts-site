"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { replyToRequestAction, type ReplyFormState } from "@/app/admina/(shell)/messaggi/actions";

const initialState: ReplyFormState = { ok: false, error: null };

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title="Invia risposta"
      className="flex-shrink-0 w-10 h-10 rounded-full bg-green-deep text-white grid place-items-center hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {pending ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 -ml-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 20.5v-6l8-2-8-2v-6l18 8-18 8z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Barra di risposta compatta stile chat: campo su una riga (si espande scrivendo)
 * + pulsante invio tondo a destra. Pensata per stare in fondo alla conversazione,
 * senza box/intestazione propri. Invio anche con Enter (Shift+Enter = a capo).
 */
export default function ReplyForm({ requestId }: { requestId: string }) {
  const [state, formAction] = useFormState(replyToRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pulisci il campo dopo l'invio riuscito.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }, [state.ok]);

  // Auto-resize del campo mentre si scrive (cap a poche righe).
  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  return (
    <div className="mt-4">
      <form action={formAction} ref={formRef}>
        <input type="hidden" name="id" value={requestId} />
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            name="body"
            rows={1}
            required
            placeholder="Scrivi un messaggio…"
            onInput={(e) => autoGrow(e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-graphite placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-end/30 focus:border-green-end/40 transition-shadow resize-none leading-relaxed max-h-36"
          />
          <SendButton />
        </div>

        {state.error && (
          <p className="text-red-500 text-xs mt-2 px-1">{state.error}</p>
        )}
        {state.ok && (
          <p className="text-green-end text-xs mt-2 px-1 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Risposta inviata.
          </p>
        )}
      </form>
    </div>
  );
}
