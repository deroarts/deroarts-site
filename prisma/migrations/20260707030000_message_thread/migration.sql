-- Conversazioni (thread) nella sezione Messaggi — migrazione ADDITIVA.
-- Nuovo enum direzione + 2 colonne su requests + indice. Nessun DROP, dati intatti.
-- Le colonne sono nullable/con default → sicure sulle righe esistenti.

-- 1) Enum direzione messaggio.
DO $$ BEGIN
  CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Nuove colonne su requests.
ALTER TABLE "public"."requests"
  ADD COLUMN IF NOT EXISTS "thread_key" TEXT,
  ADD COLUMN IF NOT EXISTS "direction" "MessageDirection" NOT NULL DEFAULT 'inbound';

-- 3) Indice per raggruppare velocemente per thread.
CREATE INDEX IF NOT EXISTS "requests_thread_key_idx"
  ON "public"."requests" ("thread_key");
