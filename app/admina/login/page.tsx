"use client";

import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { loginAction } from "./actions";
import PinInput from "@/components/admin/PinInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-green-deep text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {pending ? "Accesso in corso…" : "Accedi"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, { error: null });

  return (
    <div className="min-h-screen bg-dark-green-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/brand/logo-horizontal-on-dark.svg"
            alt="DeroArts"
            width={160}
            height={44}
            priority
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-graphite mb-6 text-center tracking-wide">
            ADMIN
          </h1>

          {state.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1.5">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1.5">
                PIN
              </label>
              <PinInput name="pin" placeholder="" />
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
