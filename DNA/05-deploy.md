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
- **Storage:** `STORAGE_MODE=supabase` + implementare `SupabaseStorageAdapter` (`@supabase/storage-js`) + `case "supabase"` nella factory.
- **Mail:** `MAIL_MODE=smtp` + `pnpm add nodemailer @types/nodemailer` + `SmtpMailAdapter` (`nodemailer.createTransport({host:SMTP_HOST, port:465, secure:true, auth:{user,pass}})`) + `case "smtp"` nella factory. Host EU: `smtp.zoho.eu`.

## Checklist primo deploy
- [ ] `npx prisma migrate deploy` sul DB Supabase (+ opzionale `db seed`)
- [ ] `DATABASE_URL` in Session mode (porta 5432), non Transaction
- [ ] `SESSION_SECRET` nuovo random (`openssl rand -base64 32`), diverso da dev
- [ ] `ADMIN_PASSWORD` = hash bcrypt (`bcryptjs.hashSync('pass',12)`), non plain
- [ ] `MAIL_MODE=smtp` + credenziali Zoho (app-password)
- [ ] `STORAGE_MODE=supabase` + credenziali Supabase
- [ ] `NEXT_PUBLIC_SITE_URL=https://deroarts.com`
- [ ] `DEV_UA_SWITCH` assente o `false` (rimuovere il DevSwitcher)
- [ ] Verifica `/robots.txt` blocca `/admina`, `/sitemap.xml` lista i progetti pubblicati
- [ ] Test: login admin, form richieste (email reale arriva), upload immagine (finisce nel bucket)
- [ ] DNS deroarts.com → Render; aggiornare `LINK_DEPLOY` / `LINK_DEPLOY ADMIN` in App Control

## Variabili produzione
Elenco completo con descrizioni in `.env.example`. Regola `NEXT_PUBLIC_` in [[02-regole]]. Segreti (Secret in Render): `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `SMTP_PASS`, `SUPABASE_SERVICE_ROLE_KEY`.
