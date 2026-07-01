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
