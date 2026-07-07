-- Performance: additive indexes on "requests" for the admin Messaggi page.
-- Purely additive (CREATE INDEX IF NOT EXISTS) — no data change, safe to apply.
--
-- Why:
--  1) messaggi/page.tsx filters WHERE direction='inbound' ORDER BY created_at DESC
--     over the whole table (no pagination yet) → a (direction, created_at DESC)
--     index turns a full scan + sort into an index scan.
--  2) messaggi/[id]/page.tsx marks a thread read with
--     updateMany WHERE email = ? AND direction = ? AND status = ?
--     → a (email, direction, status) index makes that write targeted.
--
-- To apply later:  add matching @@index() lines to prisma/schema.prisma on the
-- Request model, then `pnpm prisma migrate deploy` (or migrate dev in local).

CREATE INDEX IF NOT EXISTS "requests_direction_created_at_idx"
  ON "requests" ("direction", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "requests_email_direction_status_idx"
  ON "requests" ("email", "direction", "status");
