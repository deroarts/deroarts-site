-- Contatore quota email (Resend Free) — migrazione ADDITIVA.
-- Nuova tabella per l'alert di quota (100/giorno, 3.000/mese, invio+ricezione).
-- Nessun DROP, nessun dato toccato. RLS abilitata deny-by-default, coerente col
-- resto: Prisma si connette come owner e bypassa RLS; nessuna policy → anon/
-- authenticated non hanno accesso via PostgREST.

CREATE TABLE IF NOT EXISTS "public"."email_counters" (
  "day"              TEXT NOT NULL,
  "sent"             INTEGER NOT NULL DEFAULT 0,
  "received"         INTEGER NOT NULL DEFAULT 0,
  "alert_day_sent"   BOOLEAN NOT NULL DEFAULT false,
  "alert_month_sent" BOOLEAN NOT NULL DEFAULT false,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_counters_pkey" PRIMARY KEY ("day")
);

ALTER TABLE "public"."email_counters" ENABLE ROW LEVEL SECURITY;
