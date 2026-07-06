"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { replyToRequestAction, type ReplyFormState } from "@/app/admina/(shell)/messaggi/actions";

const initialState: ReplyFormState = { ok: false, error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 rounded-xl bg-green-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Invio…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Invia risposta
        </>
      )}
    </button>
  );
}

export default function ReplyForm({
  requestId,
  fromAddress,
  toEmail,
  alreadyReplied,
}: {
  requestId: string;
  fromAddress: string;
  toEmail: string;
  alreadyReplied: boolean;
}) {
  const [state, formAction] = useFormState(replyToRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea after a successful send.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
          Rispondi
        </h2>
        {alreadyReplied && (
          <span className="text-xs text-green-end font-medium inline-flex items-center gap-1">
            ↩ Hai già risposto
          </span>
        )}
      </div>

      <div className="text-xs text-gray-400 mb-3 space-y-0.5">
        <p>
          <span className="text-gray-400">Da:</span>{" "}
          <span className="font-medium text-gray-600">{fromAddress}</span>
        </p>
        <p>
          <span className="text-gray-400">A:</span>{" "}
          <span className="font-medium text-gray-600">{toEmail}</span>
        </p>
      </div>

      <form action={formAction} ref={formRef}>
        <input type="hidden" name="id" value={requestId} />
        <textarea
          name="body"
          rows={6}
          required
          placeholder="Scrivi qui la tua risposta…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-graphite placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-end/30 focus:border-green-end/40 transition-shadow resize-y leading-relaxed"
        />

        {state.error && (
          <p className="text-red-500 text-sm mt-2">{state.error}</p>
        )}
        {state.ok && (
          <p className="text-green-end text-sm mt-2 inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Risposta inviata al cliente.
          </p>
        )}

        <div className="flex justify-end mt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
