"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useSwipeToDelete } from "./useSwipeToDelete";
import { deleteRequestAction } from "@/app/admina/(shell)/messaggi/actions";

interface Props {
  id: string;
  href: string;
  unread: boolean;
  children: React.ReactNode;
}

/**
 * Card messaggio su mobile con swipe-to-delete (scorri a sinistra → Elimina),
 * pattern nativo iOS. Il contenuto della card è passato come children.
 */
export default function MessageCardMobile({ id, href, unread, children }: Props) {
  const [pending, start] = useTransition();

  function remove() {
    if (confirm("Eliminare definitivamente questo messaggio? L'azione non è reversibile.")) {
      start(() => deleteRequestAction(id));
    }
  }

  const swipe = useSwipeToDelete(remove);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Pannello elimina (dietro la card) */}
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Elimina messaggio"
        style={{ width: swipe.panelWidth }}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white disabled:opacity-60"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Card (scorrevole) */}
      <div {...swipe.handlers} style={swipe.style} className="relative">
        <Link
          href={href}
          onClick={(e) => {
            // se lo swipe è aperto, il tap chiude invece di navigare
            if (swipe.open) {
              e.preventDefault();
              swipe.reset();
            }
          }}
          className={`block bg-white rounded-2xl border shadow-sm p-4 active:scale-[0.99] transition-transform ${
            unread ? "border-green-end/30" : "border-gray-100"
          }`}
        >
          {children}
        </Link>
      </div>
    </div>
  );
}
