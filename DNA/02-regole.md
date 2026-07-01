# 02 — Regole non negoziabili

## Sicurezza / segreti
- `.env`, `.env.local`, `.mcp.json`, `.agent/` **mai** committati (già in `.gitignore`). Verificare `git status` prima di ogni push.
- Nessun segreto in chiaro nel codice o nei commit; mai stampare token/chiavi/password in chat o log.
- `NEXT_PUBLIC_*` finisce nel bundle client: **solo** `NEXT_PUBLIC_SITE_URL` può essere pubblico. Mai prefissare `NEXT_PUBLIC_` a `SESSION_SECRET`, `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`.
- **RLS attiva** su tutte le tabelle Supabase (migrazione `enable_rls`, deny-by-default). L'app accede via Prisma come owner (bypassa RLS); la service_role key non deve mai raggiungere il browser.

## DevSwitcher U/A — REGOLA PERMANENTE
Strumento **SOLO di sviluppo** (`components/DevSwitcher.tsx`, un cerchio in basso a destra: "U" in user, "A" in admina).
- Deve restare **sempre indipendente** e **mai bloccato** da auth/privacy/sicurezza/RLS.
- Gated da `DEV_UA_SWITCH=true` (assente in prod). Quando `true`, `middleware.ts` **bypassa** l'auth su `/admina`; quando `false`/assente, login obbligatorio.
- Verrà **eliminato prima della produzione**. Nessun lavoro futuro su auth/sicurezza deve interferire col suo funzionamento in dev.

## Deploy / infra
- **Un push su `main` = deploy in produzione**: trattarlo come azione ad alto rischio, chiedere conferma.
- Nessuna operazione su DB/auth/deploy/eliminazione dati senza conferma esplicita.
- Free tier: Supabase max 2 progetti + keepalive; Render deploy unico (front+back insieme). Vedi [[04-infrastruttura]].

## Documentazione
- `DNA/` si aggiorna solo su richiesta esplicita di consolidamento. Fonte di verità = codice.
- Errori ricorrenti / pattern problematici → una riga in `LEARNINGS.md` (root), non qui.
