"use client";

import { useEffect, useState } from "react";

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "off"
  | "on"
  | "working";

// Convert a base64 VAPID public key to the byte buffer the Push API expects.
// Returns a fresh ArrayBuffer (BufferSource) to satisfy applicationServerKey typing.
function urlBase64ToBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

export default function NotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // On mount: detect current subscription state for THIS device.
  useEffect(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setStatus(sub ? "on" : "off");
      } catch {
        setStatus("off");
      }
    })();
  }, [supported]);

  async function enable() {
    setError(null);
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      // Fetch the VAPID public key from the server.
      const cfg = await fetch("/api/admin/push").then((r) => r.json());
      const vapid = cfg?.vapidPublicKey as string | undefined;
      if (!vapid) {
        setError("Configurazione notifiche mancante sul server.");
        setStatus("off");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(vapid),
      });

      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");

      setStatus("on");
    } catch (e) {
      console.error(e);
      setError("Attivazione non riuscita. Riprova.");
      setStatus("off");
    }
  }

  async function disable() {
    setError(null);
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (e) {
      console.error(e);
      setError("Disattivazione non riuscita. Riprova.");
      setStatus("on");
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const isOn = status === "on";
  const busy = status === "working" || status === "loading";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-graphite flex items-center gap-2">
            <svg className="w-5 h-5 text-green-end" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifiche sul telefono
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Ricevi un avviso sul dispositivo a ogni nuovo messaggio dal sito.
            Puoi attivarle o disattivarle quando vuoi, su ogni dispositivo.
          </p>
        </div>

        {/* Toggle */}
        {(status === "on" || status === "off" || status === "working") && (
          <button
            type="button"
            onClick={isOn ? disable : enable}
            disabled={busy}
            aria-pressed={isOn}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-end/40 ${
              isOn ? "bg-green-gradient" : "bg-gray-300"
            } ${busy ? "opacity-60 cursor-wait" : ""}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        )}
      </div>

      {/* Status line */}
      <div className="mt-4 text-sm">
        {status === "loading" && (
          <span className="text-gray-400">Verifica in corso…</span>
        )}
        {status === "on" && (
          <span className="inline-flex items-center gap-1.5 text-green-end font-medium">
            <span className="w-2 h-2 rounded-full bg-green-end" /> Attive su questo dispositivo
          </span>
        )}
        {status === "off" && (
          <span className="text-gray-400">Non attive su questo dispositivo</span>
        )}
        {status === "denied" && (
          <span className="text-amber-600">
            Le notifiche sono bloccate nelle impostazioni del browser. Sbloccale
            dal lucchetto accanto all&apos;indirizzo per poterle attivare.
          </span>
        )}
        {status === "unsupported" && (
          <span className="text-gray-400">
            Questo dispositivo/browser non supporta le notifiche push. Su iPhone
            aggiungi prima il sito alla schermata Home.
          </span>
        )}
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
