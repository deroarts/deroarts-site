# 01 — Stato progetto

## Cos'è
Vetrina/storefront per piccoli software e app ("gestionali" e utilità) di un singolo proprietario. I visitatori sfogliano prodotti, provano demo, chiedono info. Area admin privata per pubblicare progetti e gestire richieste. Tutto in **italiano**. Dominio: **deroarts.com**.

## Stack
Next.js 14 (App Router, React 18, TS) · Tailwind · Prisma + PostgreSQL (Supabase) · iron-session · sharp. Pacchetto singolo alla root (non monorepo, anche se `pnpm-workspace.yaml` esiste con `packages: []`).

## Stato reale (verificato dal codice)
- **Sito pubblico completo**: home, griglia progetti con filtro categoria, dettaglio progetto (cover + gallery + azioni), contatti.
- **Admin completo** su `/admina`: login, CRUD progetti/categorie, inbox richieste, dev-outbox, anteprima progetti non pubblicati (token HMAC), impostazioni (placeholder).
- **Flusso richieste**: server action con Zod, salva su DB, invia 2 email (owner + auto-reply utente).
- **Upload immagini**: `/api/upload` auth-gated, sharp comprime cover/gallery, editor canvas con crop/zoom.
- **SEO/polish**: sitemap, robots, 404, error boundary — tutti presenti.
- **DB**: 2 migrazioni applicate (init + enable_rls). RLS attiva su tutte le tabelle. Contenuti (progetti/categorie) gestiti dall'admin — il conteggio è volatile, non fissarlo qui.

## Deploy in produzione
Email (invio + ricezione), storage Supabase e bucket sono già implementati e in uso.
In prod servono solo i flip di ambiente: `MAIL_MODE=resend`, `STORAGE_MODE=supabase`.
Dettagli in [[05-deploy]].

## Ambiente locale
- Avvio: `PORT=5001 pnpm dev` → http://localhost:5001 (admin: `/admina/login`).
- Credenziali admin da `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Con `DEV_UA_SWITCH=true` l'admin è accessibile senza login (vedi [[02-regole]]).

> Nota: `docs/HANDOFF.md` (rimosso) descriveva il Modulo 6 come "not started" — era **obsoleto**: tutto quel lavoro è già nel codice.
