# DeroArts — Status Report

> Stato reale verificato contro il codice il 2026-07-02. Il codice è la fonte di verità.
> Nota: i vecchi `docs/HANDOFF.md` / `DEPLOY.md` / `SUPABASE.md` sono stati consolidati in `DNA/` (vedi `DNA/00-indice.md`).

---

## 1. Fatto ✅

| Voce | Stato | Evidenza |
|------|-------|----------|
| Sito pubblico (home, /progetti, /progetti/[slug], /contatti) | DONE | `app/(public)/**`, home locale/prod HTTP 200 |
| Area admin `/admina` (login, progetti, categorie, richieste, dev-outbox, impostazioni) | DONE | `app/admina/**`, redirect `/admina`→`/admina/progetti` 200 |
| Flusso richieste (Zod + insert DB + 2 email) | DONE | `app/actions/requests.ts`, `lib/mail/templates.ts` |
| Upload immagini (sharp, MIME allowlist, editor canvas) | DONE | `app/api/upload/route.ts`, `components/admin/ImageFrameEditor.tsx` |
| SEO/polish (sitemap, robots, 404, error, preview token) | DONE | `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/error.tsx`, `lib/preview-token.ts` |
| DB schema Prisma (5 modelli) + migrazioni | DONE | `prisma/schema.prisma`; `prisma migrate status` = "up to date" |
| Seed dati demo (2 categorie, 3 progetti, 8 azioni) | DONE | `prisma/seed.ts`; DB: projects=3, categories=2, project_actions=8 |
| `prisma.seed` in package.json | DONE | commit `46bd734` |
| Adapter pattern (storage/mail/auth) | DONE | `lib/adapters/`, `lib/auth/` |
| DevSwitcher (cerchio singolo U/A, gated, bypass auth dev) | DONE | `components/DevSwitcher.tsx`, `middleware.ts` |
| Pulizia Replit completa | DONE | zero occorrenze "replit"; commit `29ac890` |
| Rinomina `/admin` → `/admina` | DONE | build: solo rotte `/admina`, `/admin`→404 |
| RLS deny-by-default su tutte le tabelle | DONE | migrazione `20260702000000_enable_rls`; 6 tabelle con RLS |
| Keepalive Supabase (GitHub Actions ogni 2gg) | DONE | `.github/workflows/supabase-keepalive.yml`, primo run success |
| DNA/ (governance + stato) | DONE | `DNA/00-indice.md` … `06-decision-log.md` |
| Governance multi-agent | DONE | `AGENTS.md`, hook `.claude/settings.json` |
| Suite test E2E/visual (Playwright) | DONE | `tests/e2e/**`, 30/30 passing |
| Tooling qualità (ESLint config + CI) | DONE | `.eslintrc.json`, `.github/workflows/ci.yml` (CI verde) |
| Primo push GitHub | DONE | `github.com/deroarts/deroarts-site`, branch `main` |
| Deploy Render (standalone + HOSTNAME fix) | DONE | `https://deroarts.onrender.com` HTTP 200 |

---

## 2. In corso 🔧

| Voce | Stato | Cosa manca per chiudere |
|------|-------|-------------------------|
| Mail in produzione | PARTIAL | Attivo `FakeMailAdapter` (scrive su `dev_outbox`). Manca `SmtpMailAdapter` (Zoho) + `MAIL_MODE=smtp` + `SMTP_PASS`. |
| Storage in produzione | PARTIAL | Attivo `LocalStorageAdapter` (`public/uploads/`, effimero su Render). Manca `SupabaseStorageAdapter` + bucket `deroarts-assets` + `STORAGE_MODE=supabase`. |
| Pagina impostazioni admin | PARTIAL | `/admina/impostazioni` è un placeholder; manca modello `Settings` e wiring. |

---

## 3. Da fare ⏳

| Passo | Stato |
|-------|-------|
| Pulizia Replit + rinomina /admina | DONE |
| Commit `prisma.seed` in package.json | DONE |
| Fix DevSwitcher (bypass auth + cerchi U/A + regola in CLAUDE.md/DNA) | DONE |
| Creare cartella DNA/ dai docs/ | DONE |
| Consolidamento — pnpm-workspace | DONE (voci `@replit/*` orfane rimosse) |
| Consolidamento — gitignore uploads | DONE (`/public/uploads/` già ignorato) |
| Consolidamento — `SupabaseStorageAdapter` | TODO |
| Consolidamento — `SmtpMailAdapter` Zoho | TODO |
| Consolidamento — `DATABASE_URL`→Supabase + migrate deploy | DONE (Supabase collegato, 3 migrazioni applicate) |
| Consolidamento — bcrypt (ADMIN_PASSWORD) + SESSION_SECRET | DONE (prod: hash bcrypt + secret dedicato su Render) |
| Consolidamento — RLS | DONE |
| Primo push GitHub | DONE |
| Render deploy | DONE (`deroarts.onrender.com`) |
| Dominio deroarts.com su Render | TODO |
| Google Search Console | TODO |

---

## 4. Verifiche tecniche

| Verifica | Esito |
|----------|-------|
| Build TypeScript | ✅ `pnpm typecheck` → 0 errori |
| App locale | ✅ porta **5001**, home HTTP 200 |
| App produzione | ✅ `https://deroarts.onrender.com` HTTP 200 |
| Migrazioni applicate | ✅ `20260701220149_init`, `20260702000000_enable_rls`, `20260702010000_keepalive_ping` — "Database schema is up to date" |
| Tabelle presenti | ✅ projects, categories, project_actions, requests, dev_outbox, ping (+ `_prisma_migrations`) |
| Seed presente | ✅ projects=3, categories=2, project_actions=8; richieste reali=0 |
| RLS | ✅ 6/6 tabelle dati con RLS attiva |
| Connessione GitHub | ✅ `gh` loggato; repo `deroarts/deroarts-site`, `main` allineato |
| Connessione Supabase | ✅ Prisma (owner) legge/scrive; anon REST bloccato dalla RLS |
| Test E2E | ✅ 30/30 (Playwright, desktop+mobile) |
| CI | ✅ workflow `ci.yml` verde (typecheck+lint+build) |

---

## 5. Problemi / rischi aperti

- **Mail e storage in modalità dev** (`fake`/`local`): in produzione le email non partono davvero e le immagini caricate sono effimere (Render azzera il filesystem ai redeploy). Chiudere con gli adapter prod.
- **Dominio non collegato**: il sito è su `deroarts.onrender.com`, non ancora su `deroarts.com` (DNS Cloudflare da puntare a Render).
- **Free tier**: Render dorme dopo 15 min (cold start ~30s); Supabase protetto dal keepalive. Nessun rischio di saturazione (DB ~10MB/500MB).
- **File oltre 300 righe** (governance): `components/admin/ProjectForm.tsx` (470), `ImageFrameEditor.tsx` (348) — da dividere quando toccati.
- **Privacy EU**: manca cookie/informativa banner prima di traffico reale.
- **Nessun TODO/FIXME** reale nel codice applicativo (solo `placeholder=` HTML legittimi).
- **`/admina/impostazioni`** è un placeholder non funzionale (basso impatto).
