# 06 — Decision log

Registro delle decisioni tecniche rilevanti. Una riga per decisione: data · decisione · motivo. Aggiungere in coda, non riscrivere lo storico.

| Data | Decisione | Motivo |
|------|-----------|--------|
| 2026-07-02 | Rotta admin `/admin` → `/admina` | Scelta del proprietario; aggiornato codice, middleware, robots, DNA. |
| 2026-07-02 | RLS abilitata deny-by-default su tutte le tabelle (migrazione `enable_rls`) | Sicurezza enterprise; l'app usa Prisma come owner (bypassa RLS), l'anon REST resta bloccato. |
| 2026-07-02 | `force-dynamic` su tutte le route che leggono dal DB | Evitare il prerender al build (Render falliva: nessun DB / pool saturo). Build ora passa senza `DATABASE_URL`. |
| 2026-07-02 | Deploy Render standalone + `HOSTNAME=0.0.0.0` | Lo standalone Next si legava a localhost → 502. Bind su 0.0.0.0 risolve; `PORT` iniettato da Render. |
| 2026-07-02 | Primo deploy con `MAIL_MODE=fake` + `STORAGE_MODE=local` | Avvio rapido online; SMTP Zoho e Supabase Storage si implementano dopo (vedi [[05-deploy]]). |
| 2026-07-02 | DevSwitcher = strumento solo-dev, mai vincolato da auth/sicurezza | Passaggio rapido user/admin in sviluppo; gated da `DEV_UA_SWITCH`, rimosso in prod (vedi [[02-regole]]). |
| 2026-07-02 | Governance canonica in `AGENTS.md` che richiama `CLAUDE.md` + limite file 300 righe | Portabilità multi-agent; `CLAUDE.md` è universale e si riscarica dal sync, quindi le regole di progetto vivono in `AGENTS.md`. |
| 2026-07-02 | Keepalive Supabase via GitHub Actions ogni 2gg su tabella `ping` dedicata | Free tier pausa dopo ~7gg. Tabella `ping` (RLS SELECT-only anon) evita di esporre service_role; il ping tocca Postgres (auth/health non basta). |
| 2026-07-02 | Suite E2E/visual con Playwright in `tests/e2e/` | Verifica navigazione, flussi e regressioni visive; isolata (POST intercettati, nessuna scrittura DB), esclusa dal build. |
| 2026-07-02 | ESLint config + CI di qualità (typecheck/lint/build su push+PR) | Progetto online: prevenire regressioni. `next lint` era interattivo/non configurato (rompeva la CI). |
| 2026-07-02 | Integrazione brand kit v2.0: derivati (favicon multi-size, apple-touch, OG 1200x630, PWA icons) + manifest.webmanifest | Kit ufficiale in public/deroarts-brand-kit; risolve OG-in-SVG (crawler) e aggiunge PWA/favicon coerenti. |
| 2026-07-02 | Informativa privacy (/privacy) + cookie banner minimale (GDPR EU) | Il form raccoglie PII (nome/email); conformità EU prima del traffico reale. Nessun tracker; consenso semplice via localStorage. |
| 2026-07-02 | Next.js 14.2.35 + header sicurezza (HSTS, X-Frame, nosniff, Referrer, Permissions) | Patch ramo 14 + hardening. CVE DoS residui accettati (fix solo in major 15/16, app in sviluppo). |
| 2026-07-02 | U/A pill visibile in prod via NEXT_PUBLIC_SHOW_UA_SWITCH, bypass auth resta dev-only | Richiesta: pill sempre visibile. Separato dalla navigazione il bypass login (DEV_UA_SWITCH), mai attivo in prod → /admina resta protetto. |
