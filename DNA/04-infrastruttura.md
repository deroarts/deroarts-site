# 04 — Infrastruttura

## Repository
- **GitHub:** `github.com/deroarts/deroarts-site` (branch operativa: `main`).
- Il remote `origin` locale usa il token del progetto (da App Control). Esiste anche un remote `gitsafe-backup` (backup locale).
- **Un push su `main` = deploy in produzione** (vedi [[02-regole]]).

## Database — Supabase
- Progetto Supabase ref: `spzwpoxylmpmalzxhrsh` (`https://spzwpoxylmpmalzxhrsh.supabase.co`).
- Connessione app: via **pooler** `aws-1-eu-central-1.pooler.supabase.com:5432` (region EU).
- Accesso app: **solo Prisma** come ruolo owner. L'app NON usa le API REST/Realtime di Supabase.
- RLS attiva su tutte le tabelle (deny-by-default). Auth Supabase non usato (l'app usa iron-session).
- Migrazioni versionate in `prisma/migrations/`. Verifica stato reale con `npx prisma migrate status`.

## Deploy — Render
- Provider: **Render** (deploy unico front+back). Servizio `deroarts`, id `srv-d92qjlok1i2s73d15n0g`. Procedura in [[05-deploy]].
- **URL produzione:** `https://www.deroarts.com` (custom domain su Render; origin `deroarts.onrender.com`). `deroarts.com` nudo → 301 a `www`.
- **URL admin:** `https://www.deroarts.com/admina`.

## Dominio & email — deroarts.com
- Registrar + DNS: **Cloudflare** (DNSSEC attivo, SSL full, HTTPS forzato). Non modificare registrar/nameserver/DNSSEC.
- Email: **Resend** (invio + ricezione). MX del dominio → Resend (`inbound-smtp.eu-west-1.amazonaws.com`), invio via `send.deroarts.com`. SPF/DKIM/DMARC PASS. **Zoho dismesso** il 2026-07-07.
- **Scheda completa** (record DNS, SSL, sottodomini, regole): [[07-dominio-email]].

## App Control
- Sync di segreti/variabili via `.agent/app-control.json` (ignorato da git). Rigenera `.env`/`.mcp.json`.
- Variabili canoniche in App Control. `LINK_DEPLOY` / `LINK_DEPLOY ADMIN` sono **manuali dell'utente**: dopo il collegamento del dominio vanno impostati a `https://www.deroarts.com` e `https://www.deroarts.com/admina`.

## Limiti free tier
- **Supabase:** DB 500MB (uso attuale ~10MB), Storage 1GB, banda 5GB/mese. **Pausa dopo ~1 settimana di inattività** → keepalive attivo (sotto). Usare sempre l'URL pooler.
- **Render:** spegnimento dopo 15min inattività (cold start ~30s), 500 build-min/mese, 100GB banda.
- Segnalare prima di implementare funzioni che avvicinano questi limiti.

## Keepalive Supabase
- Workflow `.github/workflows/supabase-keepalive.yml`: ogni 2 giorni legge la tabella `public.ping` (RLS SELECT-only per anon) con la anon key. Nessuna scrittura, impatto trascurabile.
- Secret GitHub richiesti: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (mai service_role).
- Rischio residuo: GitHub disabilita i workflow schedulati dopo 60gg di inattività del repo; il job si ri-abilita da solo ad ogni run (step "Re-arm schedule"). Disattivazione: elimina il file o disabilita dalla tab Actions.
