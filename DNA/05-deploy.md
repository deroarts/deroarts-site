# 05 — Deploy (Render + Supabase)

Da leggere solo al momento del deploy. L'app usa `output: "standalone"` (`next.config.mjs`).

## Prerequisiti
1. Bucket Supabase Storage `deroarts-assets` (public read, private write) creato.
2. `SupabaseStorageAdapter` implementato e collegato in `lib/adapters/index.ts`.
3. `ResendMailAdapter` implementato e collegato (invio + ricezione via Resend).
4. DNS `deroarts.com` pronto per puntare a Render.

## Render — build
- Build: `pnpm install && pnpm run build`
- Copiare gli statici nel bundle standalone (Render non lo fa da solo):
  `cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static`
- Start: `node .next/standalone/server.js` (**non** `pnpm start`)
- Node 20.x · Health check `/` · porta: Render inietta `PORT`, l'app la legge.

## Flip adapter dev → prod
- **Storage:** `STORAGE_MODE=supabase` (già implementato: `SupabaseStorageAdapter`).
- **Mail:** `MAIL_MODE=resend` + `RESEND_API_KEY`. Resend serve **solo a spedire** le email del modulo contatti a `info@deroarts.com` (e la conferma al cliente). In locale resta `fake` (solo console). Dal 2026-09-29 niente ricezione via Resend, niente notifiche push: vedi [[08-messaggi-notifiche]].

## Checklist primo deploy
- [ ] `npx prisma migrate deploy` sul DB Supabase (+ opzionale `db seed`)
- [ ] `DATABASE_URL` in Session mode (porta 5432), non Transaction
- [ ] `SESSION_SECRET` nuovo random (`openssl rand -base64 32`), diverso da dev
- [ ] `MAIL_MODE=resend` + `RESEND_API_KEY` (Secret)
- [ ] `STORAGE_MODE=supabase` + credenziali Supabase
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.deroarts.com`
- [ ] `DEV_UA_SWITCH` assente o `false` (rimuovere il DevSwitcher)
- [ ] Verifica `/robots.txt` blocca `/admina`, `/sitemap.xml` lista i progetti pubblicati
- [ ] Test: login admin, form contatti (la email arriva in `info@` sull'iPhone), upload immagine (bucket)
- [ ] DNS deroarts.com → Render; aggiornare `LINK_DEPLOY` / `LINK_DEPLOY ADMIN` in App Control

## Variabili produzione
Elenco completo con descrizioni in `.env.example`. Regola `NEXT_PUBLIC_` in [[02-regole]]. Segreti (Secret in Render): `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_API_KEY`.
