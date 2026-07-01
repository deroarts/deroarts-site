-- Enterprise hardening: enable Row Level Security (deny-by-default) on all
-- data tables. No policies are created, so the anon/authenticated PostgREST
-- roles get NO access. The application connects via Prisma using the table
-- owner role, which bypasses RLS, so app behaviour is unaffected.
-- This closes the "RLS disabled in public" advisory and is defence-in-depth
-- in case the tables are ever exposed over the Supabase REST/realtime APIs.

ALTER TABLE "public"."categories"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."project_actions"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."requests"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dev_outbox"       ENABLE ROW LEVEL SECURITY;
