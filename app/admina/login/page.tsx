"use client";

import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { loginAction } from "./actions";

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
          <h1 className="text-xl font-bold text-graphite mb-1">
            Accesso amministratore
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Area riservata — solo uso interno
          </p>

          {state.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
                placeholder="admin@deroarts.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 text-green-end focus:ring-green-end"
              />
              <span className="text-sm text-gray-600">Ricordami</span>
            </label>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
