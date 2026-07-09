"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import { changePinAction } from "@/app/admina/(shell)/impostazioni/actions";
import PinInput from "@/components/admin/PinInput";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-green-deep text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {pending ? "Salvataggio…" : "Aggiorna PIN"}
    </button>
  );
}

export default function PinManager() {
  const [state, action] = useFormState(changePinAction, { ok: false, error: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Dopo un salvataggio riuscito, pulisci i campi.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-graphite flex items-center gap-2">
        <svg className="w-5 h-5 text-green-end" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        PIN di accesso
      </h2>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
        Cambia il PIN con cui accedi all&apos;area amministratore. Serve il PIN
        attuale; il nuovo deve avere 6 cifre.
      </p>

      <form ref={formRef} action={action} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">
            PIN attuale
          </label>
          <PinInput name="currentPin" autoComplete="off" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">
              Nuovo PIN
            </label>
            <PinInput name="newPin" autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">
              Conferma nuovo PIN
            </label>
            <PinInput name="confirmPin" autoComplete="off" />
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="inline-flex items-center gap-1.5 text-sm text-green-end font-medium">
            <span className="w-2 h-2 rounded-full bg-green-end" /> PIN aggiornato.
          </p>
        )}

        <SaveButton />
      </form>
    </div>
  );
}
