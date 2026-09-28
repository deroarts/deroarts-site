# 01 — Stato progetto

## Cos'è
Vetrina/storefront per piccoli software e app ("gestionali" e utilità) di un singolo proprietario. I visitatori sfogliano prodotti, provano demo, chiedono info. Area admin privata per pubblicare progetti e gestire richieste. Tutto in **italiano**. Dominio: **deroarts.com**.

## Stack
Next.js 14 (App Router, React 18, TS) · Tailwind · Prisma + PostgreSQL (Supabase) · iron-session · sharp. Pacchetto singolo alla root (non monorepo, anche se `pnpm-workspace.yaml` esiste con `packages: []`).

## Stato reale (verificato dal codice)
- **Sito pubblico completo**: home, griglia progetti con filtro categoria, dettaglio progetto (cover + gallery + azioni), contatti.
- **Admin** su `/admina`: login (nickname + PIN), CRUD progetti/categorie, anteprima progetti non pubblicati (token HMAC), impostazioni (cambio PIN).
- **Contatti** (dal 2026-09-29): modulo con Zod + anti-spam → **una email a `info@deroarts.com`** (Reply-To = cliente) + conferma automatica al cliente. **Niente salvataggio su DB, niente sezione Messaggi**: il dialogo prosegue dall'app Mail. Vedi [[08-messaggi-notifiche]].
- **Upload immagini**: `/api/upload` auth-gated, sharp comprime cover/gallery, editor canvas con crop/zoom.
- **SEO/polish**: sitemap, robots, 404, error boundary — tutti presenti.
- **DB**: 9 migrazioni applicate (verifica con `npx prisma migrate status`). RLS attiva su tutte le tabelle. Contenuti (progetti/categorie) gestiti dall'admin — il conteggio è volatile, non fissarlo qui.

## Deploy in produzione
Email (invio + ricezione), storage Supabase e bucket sono già implementati e in uso.
In prod servono solo i flip di ambiente: `MAIL_MODE=resend`, `STORAGE_MODE=supabase`.
Dettagli in [[05-deploy]].

## Ambiente locale
- Avvio: `PORT=5001 pnpm dev` → http://localhost:5001 (admin: `/admina/login`).
- Accesso admin: nickname + PIN salvati nel DB (`admin_credentials`); `ADMIN_NICKNAME`/`ADMIN_PIN` in `.env` solo come fallback.
- Con `DEV_UA_SWITCH=true` l'admin è accessibile senza login (vedi [[02-regole]]).

> Nota: `docs/HANDOFF.md` (rimosso) descriveva il Modulo 6 come "not started" — era **obsoleto**: tutto quel lavoro è già nel codice.
