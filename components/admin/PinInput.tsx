"use client";

import { useState } from "react";

interface PinInputProps {
  name: string;
  placeholder?: string;
  autoComplete?: string;
  /** Classi extra sul contenitore (es. margini). */
  className?: string;
}

/**
 * Campo PIN numerico (6 cifre) con occhio mostra/nascondi.
 * Riusato dal login e da Impostazioni per coerenza visiva.
 */
export default function PinInput({
  name,
  placeholder = "••••••",
  autoComplete = "current-password",
  className = "",
}: PinInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        type={show ? "text" : "password"}
        name={name}
        required
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete={autoComplete}
        className="w-full pl-3 pr-11 py-2.5 border border-gray-200 rounded-lg text-base sm:text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent transition"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Nascondi PIN" : "Mostra PIN"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-gray-400 hover:text-green-end transition-colors"
      >
        {show ? (
          // occhio barrato
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          // occhio aperto
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
