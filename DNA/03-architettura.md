# 03 — Architettura (solo il non ovvio)

La struttura cartelle e lo schema sono nel repo (`app/`, `lib/`, `prisma/schema.prisma`). Qui solo i pattern che non si capiscono a colpo d'occhio.

## Pattern adapter (chiave del progetto)
Tre servizi swappabili dev↔prod via env var, stesso schema: `interface → classe concreta → factory` in `lib/`.

| Servizio | File | Env var | Dev (attivo) | Prod (da implementare) |
|----------|------|---------|--------------|------------------------|
| Storage | `lib/adapters/storage.ts` + `index.ts` | `STORAGE_MODE` | `LocalStorageAdapter` → `public/uploads/` | `SupabaseStorageAdapter` |
| Mail | `lib/adapters/mail.ts` + `index.ts` | `MAIL_MODE` | `FakeMailAdapter` → tabella `dev_outbox` | `SmtpMailAdapter` (Zoho) |
| Auth | `lib/auth/` (`adapter.ts`, `cookie-adapter.ts`, `index.ts`) | — | `CookieAuthAdapter` (iron-session) | eventuale Supabase Auth |

Per aggiungere il prod adapter: implementa l'interfaccia, aggiungi il `case` nella factory, setta le env. Dettaglio in [[05-deploy]].

## Layout / UI — standard di progetto (vincolante per pagine future)
- **Hero a schermo pieno:** ogni sezione hero usa la utility **`.hero-screen`** (`app/globals.css`), non padding "a occhio". Riempie la prima schermata sotto l'header sticky e centra il contenuto → hero + CTA **sempre visibili senza scroll** su ogni desktop/laptop. L'altezza header è la variabile CSS `--header-h` (unica fonte di verità: se cambia l'header, si aggiorna solo lì).
- **Scroll:** `ScrollToTop` (nel `layout.tsx`) forza ogni pagina/refresh a partire dall'inizio in tutta l'app.
- **Font:** sans = Poppins (`font-sans`), serif editoriale titoli = Fraunces (`font-serif`).
- **Hero illustrazione:** `components/HeroFlow.tsx` (griglia tecnica → piuma-brand vettoriale, path inline da `public/brand/deroarts-piuma-nera.svg`). Posizione blindata via costanti `F_*`/`TIP_*`.

## Auth
- `CookieAuthAdapter`: iron-session v8, cookie sigillato, scadenza 30gg. Credenziali da `ADMIN_EMAIL`/`ADMIN_PASSWORD` (plain in dev, hash bcrypt in prod).
- `middleware.ts` protegge `/admina/**` (eccetto `/admina/login`) → redirect a login se cookie assente/invalido. **Ma** se `DEV_UA_SWITCH=true` bypassa tutto (vedi [[02-regole]]).

## i18n
Campi testo tradotti = JSON `{ "it": "...", "en": "" }` (JSONB). Ora si renderizza solo `it`. Helper in `lib/i18n.ts` (`t()`, `getIt()`, `parseGallery()`). La gallery è un array JSON `[{ url, alt: {it,en} }]`.

## Immagini
- Upload: `app/api/upload/route.ts`, auth-gated, MIME allowlist (JPEG/PNG/WebP), compressione sharp (cover ≤1920px q82 ~200KB, gallery ≤1280px q80 ~150KB).
- Editor client: `ImageFrameEditor` (canvas drag+zoom+crop) e `GalleryEditor` (riordino DnD), integrati in `ProjectForm`.
- Template email in `lib/mail/templates.ts` (HTML, italiano, con `escapeHtml`).

## Anteprima progetti non pubblicati
Token HMAC-SHA256 firmato con `SESSION_SECRET`, scadenza 1h — `lib/preview-token.ts`. La pagina pubblica del progetto salta il guard `published:true` se il token è valido.

## Agent API (agenti esterni, es. Devin)
Due endpoint sotto `app/api/agent/**` — permettono a un agent esterno di **leggere i contenuti pubblici**, **caricare immagini** e **creare bozze**, senza mai toccare layout né pubblicare. Entrambi: auth header `x-api-key` == `AGENT_API_KEY` (server-only, fuori dal matcher del `middleware.ts` → guard in-handler; chiave vuota = disabilitati).
- **`GET /api/agent/projects`:** ritorna i soli progetti `published:true` con `select` esplicito + uno `style_guide` con le regole di copy. **Mai** dati cliente (requests/email) né bozze.
- **`POST /api/agent/projects`:** crea sempre `published:false`. Valida/sanifica: `title` obbligatorio, i18n coerti a `{it,en}`, URL immagini solo `http(s)`/`/…` (scarta `data:`/`javascript:`), `status` da allowlist enum, categoria collegata solo se lo slug esiste già, slug da `title.it` de-duplicato.
- **`PATCH /api/agent/projects`:** aggiorna un progetto ESISTENTE per `slug`, solo i campi passati (partial update); pulisce le immagini sostituite da Supabase (`storage.delete`, best-effort); 404 se lo slug non esiste (l'agent usa POST per i nuovi) → evita i doppioni.
- **`POST /api/agent/upload`:** riceve UN'immagine (multipart `file` + `purpose` cover|gallery), la comprime con sharp (come `api/upload` admin) e la salva via `getStorageAdapter()`; ritorna `{ url }`. L'agent carica prima le immagini qui, poi passa gli URL a `projects`. In prod lo storage è Supabase → URL pubblico permanente.
- `style_guide` (nel GET) = briefing marketing per l'agent: cover = LOGO del progetto (screenshot nella gallery), copy impersonale/no-destinatari/qualità↔prezzo, PATCH per modificare.
- Validazione manuale (no `zod`) per coerenza con `api/upload`.

## Storage immagini (permanente)
`STORAGE_MODE=supabase` → `SupabaseStorageAdapter` (`lib/adapters/storage.ts`) carica su bucket **pubblico** `SUPABASE_STORAGE_BUCKET` via REST API (nessuna dip. `supabase-js`), ritorna l'URL CDN pubblico → sopravvive ai redeploy (il disco Render è effimero, `local` perderebbe i file). `next.config.mjs` `remotePatterns` include `*.supabase.co/storage/v1/object/public/**`. Bucket: solo immagini (jpeg/png/webp), max 15MB.
