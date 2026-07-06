-- Messaggi / Email (Resend) / Notifiche push — migrazione ADDITIVA.
-- Solo aggiunte: una colonna nullable su requests + due nuove tabelle.
-- Nessun DROP, nessun dato toccato. RLS deny-by-default coerente col resto
-- (Prisma si connette come owner e bypassa RLS; le nuove tabelle non hanno
-- policy, quindi anon/authenticated non hanno accesso via PostgREST).

-- 1) Nuova colonna: quando è stata inviata l'ultima risposta dal pannello admin.
ALTER TABLE "public"."requests"
  ADD COLUMN IF NOT EXISTS "replied_at" TIMESTAMP(3);

-- 2) Iscrizioni push (una riga per dispositivo/browser dell'admin).
CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
  "id"         TEXT NOT NULL,
  "endpoint"   TEXT NOT NULL,
  "p256dh"     TEXT NOT NULL,
  "auth"       TEXT NOT NULL,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key"
  ON "public"."push_subscriptions" ("endpoint");

ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- 3) Preferenze notifiche (tabella a riga singola, chiave "global").
CREATE TABLE IF NOT EXISTS "public"."notification_settings" (
  "key"          TEXT NOT NULL,
  "push_enabled" BOOLEAN NOT NULL DEFAULT false,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "public"."notification_settings" ENABLE ROW LEVEL SECURITY;
