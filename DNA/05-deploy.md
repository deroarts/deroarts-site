# 05 — Deploy (Render + Supabase)

Da leggere solo al momento del deploy. L'app usa `output: "standalone"` (`next.config.mjs`).

## Prerequisiti
1. Bucket Supabase Storage `deroarts-assets` (public read, private write) creato.
2. `SupabaseStorageAdapter` implementato e collegato in `lib/adapters/index.ts`.
3. `SmtpMailAdapter` (Zoho) implementato e collegato.
4. DNS `deroarts.com` pronto per puntare a Render.

## Render — build
- Build: `pnpm install && pnpm run build`
- Copiare gli statici nel bundle standalone (Render non lo fa da solo):
  `cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static`
- Start: `node .next/standalone/server.js` (**non** `pnpm start`)
- Node 20.x · Health check `/` · porta: Render inietta `PORT`, l'app la legge.

## Flip adapter dev → prod
- **Storage:** `STORAGE_MODE=supabase` (già implementato: `SupabaseStorageAdapter`).
- **Mail:** `MAIL_MODE=resend` (già implementato: `ResendMailAdapter`, vedi [[08-messaggi-notifiche]]). In locale resta `fake` per non consumare invii; in prod va messo `resend`. Serve `RESEND_API_KEY` (+ `RESEND_FROM`). Il vecchio piano SMTP/Zoho (`nodemailer`) è **superato**: la ricezione resta su Zoho, l'invio dal sito passa da Resend.
- **Push (notifiche):** richiede `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. **Non rigenerare** le chiavi VAPID (invaliderebbe le iscrizioni). Usare gli stessi valori del `.env`.

## Checklist primo deploy
- [ ] `npx prisma migrate deploy` sul DB Supabase (+ opzionale `db seed`)
- [ ] `DATABASE_URL` in Session mode (porta 5432), non Transaction
- [ ] `SESSION_SECRET` nuovo random (`openssl rand -base64 32`), diverso da dev
- [ ] `ADMIN_PASSWORD` = hash bcrypt (`bcryptjs.hashSync('pass',12)`), non plain
- [ ] `MAIL_MODE=resend` + `RESEND_API_KEY` (Secret) + `RESEND_FROM=info@deroarts.com`
- [ ] `VAPID_*` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (private key = Secret) — stessi valori del `.env`
- [ ] `STORAGE_MODE=supabase` + credenziali Supabase
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.deroarts.com`
- [ ] `DEV_UA_SWITCH` assente o `false` (rimuovere il DevSwitcher)
- [ ] Verifica `/robots.txt` blocca `/admina`, `/sitemap.xml` lista i progetti pubblicati
- [ ] Test: login admin, form richieste (email reale arriva via Resend), upload immagine (bucket)
- [ ] DNS deroarts.com → Render; aggiornare `LINK_DEPLOY` / `LINK_DEPLOY ADMIN` in App Control

## Variabili produzione
Elenco completo con descrizioni in `.env.example`. Regola `NEXT_PUBLIC_` in [[02-regole]]. Segreti (Secret in Render): `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
