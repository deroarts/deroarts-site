-- Inbound email (Zoho → Resend → app): messaggi email dentro la tabella requests.
-- Migrazione ADDITIVA: nuovo enum + colonne nullable. Nessun DROP, dati intatti.

-- 1) Enum origine messaggio.
DO $$ BEGIN
  CREATE TYPE "RequestSource" AS ENUM ('site', 'email');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Nuove colonne su requests (tutte con default/nullable → sicure sui dati esistenti).
ALTER TABLE "public"."requests"
  ADD COLUMN IF NOT EXISTS "source" "RequestSource" NOT NULL DEFAULT 'site',
  ADD COLUMN IF NOT EXISTS "subject" TEXT,
  ADD COLUMN IF NOT EXISTS "reply_to_email" TEXT,
  ADD COLUMN IF NOT EXISTS "inbound_email_id" TEXT;

-- 3) Unicità dell'id Resend (idempotenza del webhook). Indice unico che ignora i NULL.
CREATE UNIQUE INDEX IF NOT EXISTS "requests_inbound_email_id_key"
  ON "public"."requests" ("inbound_email_id");

CREATE INDEX IF NOT EXISTS "requests_source_idx"
  ON "public"."requests" ("source");
