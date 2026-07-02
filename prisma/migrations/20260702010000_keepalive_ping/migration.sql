-- Keepalive: minimal, static, read-only table for the free-tier ping.
-- One fixed row, never grows, no app logic. RLS on with a SELECT-only policy
-- for the anon role so the scheduler can read it with the low-privilege anon
-- key (service_role is never exposed). The ping touches Postgres, which is what
-- keeps a paused-on-inactivity free project awake.

CREATE TABLE IF NOT EXISTS "public"."ping" (
  "id" integer PRIMARY KEY,
  "note" text NOT NULL DEFAULT 'keepalive'
);

INSERT INTO "public"."ping" ("id", "note")
VALUES (1, 'keepalive')
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "public"."ping" ENABLE ROW LEVEL SECURITY;

-- Read-only access for anon (and authenticated). No INSERT/UPDATE/DELETE policy
-- exists, so writes remain denied by default.
CREATE POLICY "ping_select_anon" ON "public"."ping"
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON "public"."ping" TO anon, authenticated;
