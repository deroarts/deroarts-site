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
- **DB**: 2 migrazioni applicate (init + enable_rls). RLS attiva su tutte le tabelle. Dati demo caricati (3 progetti, 2 categorie).

## Cosa manca (solo per il deploy in produzione)
- `SmtpMailAdapter` (Zoho) — ora attivo `FakeMailAdapter` (scrive su `dev_outbox`).
- `SupabaseStorageAdapter` — ora attivo `LocalStorageAdapter` (`public/uploads/`, effimero su Render).
- Bucket Supabase Storage `deroarts-assets` (non ancora creato).
Dettagli in [[05-deploy]].

## Ambiente locale
- Avvio: `PORT=5001 pnpm dev` → http://localhost:5001 (admin: `/admina/login`).
- Credenziali admin da `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Con `DEV_UA_SWITCH=true` l'admin è accessibile senza login (vedi [[02-regole]]).

> Nota: `docs/HANDOFF.md` (rimosso) descriveva il Modulo 6 come "not started" — era **obsoleto**: tutto quel lavoro è già nel codice.
