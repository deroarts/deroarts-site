-- Credenziali admin (nickname + PIN) gestibili da Impostazioni.
-- Tabella single-row (key = "admin"). Il PIN è salvato SOLO come hash bcrypt.
-- Additiva e non distruttiva. RLS abilitata come sulle altre tabelle:
-- nessuna policy → anon/authenticated PostgREST non hanno accesso; l'app
-- scrive via Prisma (owner role, bypassa RLS).

CREATE TABLE "public"."admin_credentials" (
    "key"        TEXT NOT NULL,
    "nickname"   TEXT NOT NULL,
    "pin_hash"   TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admin_credentials_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "public"."admin_credentials" ENABLE ROW LEVEL SECURITY;

-- Seed iniziale: nickname "dero", PIN "140478" (hash bcrypt, cost 10).
-- Idempotente: se la riga esiste già (PIN eventualmente cambiato dall'admin),
-- non viene sovrascritta.
INSERT INTO "public"."admin_credentials" ("key", "nickname", "pin_hash", "updated_at")
VALUES (
    'admin',
    'dero',
    '$2b$10$qm/mMIGT8rU5wFHojuNmPeCy6QYhptHhD8zRyS7aHP5yXuqHBQY7a',
    now()
)
ON CONFLICT ("key") DO NOTHING;
