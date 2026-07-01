# DeroArts — Developer Handoff

**For:** Next-phase developer (Devin)
**Date:** July 2026
**Status:** Modules 0–5 complete and merged. Modules 6–7 not started.

---

## 1. Project Overview

DeroArts is a single-owner Italian-language showcase/storefront for small software products. It is a **standalone Next.js 14 App Router** application (TypeScript + Tailwind CSS + Prisma + PostgreSQL) living at the repository root — not inside any sub-package. The design and all UI copy are Italian.

**Live URL:** `https://deroarts.com` (not yet deployed — Replit dev server only)

---

## 2. Repository Structure

```
/
├── app/
│   ├── layout.tsx                    # Root layout — Poppins font, metadata
│   ├── globals.css
│   ├── (public)/                     # Public-facing pages (Header + Footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Home — hero + featured projects
│   │   ├── progetti/
│   │   │   ├── page.tsx              # Projects grid with category filter
│   │   │   └── [slug]/page.tsx       # Project detail
│   │   └── contatti/page.tsx         # Contact form
│   ├── admin/
│   │   ├── layout.tsx                # Thin shell (passes children)
│   │   ├── login/                    # Login page + server action
│   │   └── (shell)/                  # Auth-protected admin area
│   │       ├── layout.tsx            # Fetches session + unread count
│   │       ├── page.tsx              # Admin dashboard (redirect to progetti)
│   │       ├── progetti/             # Project list, new, edit
│   │       ├── categorie/            # Category CRUD
│   │       ├── richieste/            # Request inbox
│   │       ├── dev-outbox/           # Fake mail viewer (dev only)
│   │       └── impostazioni/         # Settings placeholder (not wired)
│   ├── api/
│   │   └── upload/route.ts           # POST multipart image upload (auth-gated)
│   └── actions/
│       └── requests.ts               # createRequest server action
├── components/
│   ├── admin/
│   │   ├── AdminShell.tsx            # Sidebar + mobile drawer shell
│   │   ├── ProjectForm.tsx           # Create/edit form with image editors
│   │   ├── ImageFrameEditor.tsx      # Canvas drag/zoom crop editor
│   │   ├── GalleryEditor.tsx         # Gallery list with DnD reorder
│   │   └── DeleteProjectButton.tsx
│   ├── AspectImage.tsx               # Fixed-ratio image with fallback
│   ├── ActionButtons.tsx             # Project CTA buttons
│   ├── CategoryFilter.tsx            # URL-param category filter
│   ├── ContactForm.tsx               # General contact form
│   ├── Footer.tsx
│   ├── Header.tsx                    # Mobile hamburger nav
│   ├── ProjectCard.tsx
│   ├── RequestForm.tsx               # Request-info modal form
│   └── StatusBadge.tsx
├── lib/
│   ├── adapters/
│   │   ├── index.ts                  # getStorageAdapter() / getMailAdapter()
│   │   ├── storage.ts                # StorageAdapter interface + LocalStorageAdapter
│   │   └── mail.ts                   # MailAdapter interface + FakeMailAdapter
│   ├── auth/
│   │   ├── index.ts                  # getSession() / login() / logout()
│   │   ├── adapter.ts                # AuthAdapter interface
│   │   ├── cookie-adapter.ts         # CookieAuthAdapter (iron-session v8)
│   │   └── session.ts                # Session types + getSessionSecret()
│   ├── db/
│   │   └── client.ts                 # Prisma singleton
│   └── i18n.ts                       # t() / getIt() / parseGallery() helpers
├── middleware.ts                      # Protects /admin/** → redirect to /admin/login
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── brand/                        # SVG logos, symbol, favicon
│   └── uploads/                      # Local image storage (dev only)
├── next.config.mjs                   # output: standalone; serverActions bodySizeLimit 5mb
├── tailwind.config.ts
├── .env.example                      # All env vars documented
└── docs/
    └── HANDOFF.md                    # This file
```

---

## 3. Database Schema (Prisma / PostgreSQL)

All translatable text fields use a JSONB shape `{ "it": "...", "en": "" }`. English is always an empty string for now; the app renders only the `it` value.

```prisma
enum ProjectStatus  { available | coming_soon | demo_available }
enum ActionType     { demo | request_info | download | app_store | play_store | external }
enum RequestStatus  { new | read | handled }

model Category {
  id         String    @id @default(cuid())
  name       Json      // { it, en }
  slug       String    @unique
  sort_order Int       @default(0)
  created_at DateTime  @default(now())
  projects   Project[]
  @@map("categories")
}

model Project {
  id                String        @id @default(cuid())
  slug              String        @unique
  title             Json          // { it, en }
  short_description Json          // { it, en }
  long_description  Json          // { it, en }
  status            ProjectStatus @default(available)
  category_id       String?       // FK → Category (SetNull on delete)
  cover_image_url   String?
  gallery           Json          @default("[]")
                                  // [{ url: string, alt: { it, en } }]
  published         Boolean       @default(false)
  sort_order        Int           @default(0)
  from_email        String?       // per-project reply-from address
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  actions           ProjectAction[]
  requests          Request[]
  @@map("projects")
}

model ProjectAction {
  id         String     @id @default(cuid())
  project_id String     // FK → Project (Cascade on delete)
  type       ActionType
  label      Json       // { it, en }
  url        String?    // null for request_info
  enabled    Boolean    @default(true)
  sort_order Int        @default(0)
  @@map("project_actions")
}

model Request {
  id         String        @id @default(cuid())
  project_id String?       // FK → Project (SetNull on delete); null = general contact
  name       String
  email      String
  message    String
  status     RequestStatus @default(new)
  created_at DateTime      @default(now())
  handled_at DateTime?
  @@map("requests")
}

model DevOutbox {
  id         String   @id @default(cuid())
  to         String
  from       String
  subject    String
  body       String
  created_at DateTime @default(now())
  @@map("dev_outbox")
}
```

---

## 4. Adapter Architecture

All three adapters follow the same pattern: interface → concrete class → factory function reading an env var. Swapping for production means implementing the interface and updating the factory.

### 4a. Storage Adapter (`lib/adapters/storage.ts`)

```
interface StorageAdapter {
  upload(buffer, originalName, mimeType): Promise<string>  // returns public URL
  delete(url): Promise<void>
}
```

| `STORAGE_MODE` | Class | Behaviour |
|---|---|---|
| `local` (default) | `LocalStorageAdapter` | Saves to `public/uploads/`, returns `/uploads/<file>` |
| `supabase` | _not yet written_ | Should upload to Supabase Storage bucket, return CDN URL |

**To wire Supabase Storage:**
1. Implement `SupabaseStorageAdapter` using `@supabase/storage-js`
2. Add `case "supabase": return new SupabaseStorageAdapter()` to the factory
3. Set `STORAGE_MODE=supabase` + `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` + `SUPABASE_STORAGE_BUCKET`

### 4b. Mail Adapter (`lib/adapters/mail.ts`)

```
interface MailAdapter {
  sendMail({ to, from, subject, html }): Promise<void>
}
```

| `MAIL_MODE` | Class | Behaviour |
|---|---|---|
| `fake` (default) | `FakeMailAdapter` | Console log + insert into `dev_outbox` table |
| `smtp` | _not yet written_ | Should send via Nodemailer with Zoho SMTP config |

**To wire Zoho SMTP:**
1. `pnpm add nodemailer @types/nodemailer`
2. Implement `SmtpMailAdapter` using `nodemailer.createTransport({ host: SMTP_HOST, port: 465, secure: true, auth: { user, pass } })`
3. Add `case "smtp": return new SmtpMailAdapter()` to the factory
4. Set `MAIL_MODE=smtp` + `SMTP_HOST` + `SMTP_PORT` + `SMTP_USER` + `SMTP_PASS`

**Email templates** live inline in `app/actions/requests.ts` (two HTML strings: owner notification + user auto-reply). Both use the project's `from_email` field, falling back to `info@deroarts.com`.

### 4c. Auth Adapter (`lib/auth/`)

```
interface AuthAdapter {
  login(email, password, remember): Promise<boolean>
  logout(): Promise<void>
  getSession(): Promise<SessionData | null>
}
```

| Adapter | Behaviour |
|---|---|
| `CookieAuthAdapter` (current) | iron-session v8 sealed cookie; credentials from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars; bcrypt hash accepted for `ADMIN_PASSWORD` in production |
| Supabase Auth (future) | Implement `SupabaseAuthAdapter`; swap in factory |

`middleware.ts` reads the session cookie on every `/admin/**` request (except `/admin/login`) and redirects to `/admin/login` if missing or invalid.

---

## 5. Environment Variables

See `.env.example` for the full list with descriptions. Summary:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ always | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ always | ≥32-char secret for iron-session |
| `ADMIN_EMAIL` | ✅ always | Admin login email |
| `ADMIN_PASSWORD` | ✅ always | Plain text (dev) or bcrypt hash (prod) |
| `MAIL_MODE` | ✅ always | `fake` or `smtp` |
| `STORAGE_MODE` | ✅ always | `local` or `supabase` |
| `NEXT_PUBLIC_SITE_URL` | ✅ always | Base URL, no trailing slash |
| `SMTP_HOST/PORT/USER/PASS` | when MAIL_MODE=smtp | Zoho SMTP credentials |
| `SUPABASE_URL` | when STORAGE_MODE=supabase | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | when STORAGE_MODE=supabase | Service role key (server-only) |
| `SUPABASE_STORAGE_BUCKET` | when STORAGE_MODE=supabase | Bucket name |
| `DEV_UA_SWITCH` | dev only | `true` shows the DevSwitcher pill |

---

## 6. What IS Done (Modules 0–5)

### Module 0 — Scaffold
Next.js 14 App Router at repo root, Tailwind with brand tokens (graphite, green-start, green-end, dark-green, light-surface, gradient utilities), Poppins font, brand SVGs in `public/brand/`, `next.config.mjs` with `output: "standalone"`.

### Module 1 — Data Model & Adapters
Full Prisma schema with all 5 tables, first migration applied, `LocalStorageAdapter`, `FakeMailAdapter`, DB singleton, seed script with 2 categories + 3 sample projects.

### Module 2 — Public Site
Home page (hero + featured projects + CTA strip), Projects grid with category URL-param filter, Project detail (breadcrumb, cover, gallery, action buttons, long description), Contact page (split layout + form). All pages have `generateMetadata` with Italian title, description, and Open Graph tags. `AspectImage` component handles 16:10 cover and 4:3 gallery ratios with placeholder fallback.

### Module 3 — Admin Shell, Auth & CRUD
`/admin/login` with Remember Me. iron-session v8 sealed cookie, 30-day expiry. `middleware.ts` protects all admin routes. `AdminShell` with desktop sidebar + mobile slide-in drawer (hamburger), unread request badge. Projects CRUD (list with thumbnails, published toggle, delete), Categories CRUD, project form with actions sub-editor.

### Module 4 — Request Info Flow & Dev Outbox
`createRequest` server action: Zod validation, DB insert, two fake emails (owner notification + user auto-reply). Request-info modal on project detail. General contact form on `/contatti`. Admin Richieste inbox with status tabs (Nuova/Letta/Gestita), per-request detail + status update. Dev Outbox at `/admin/dev-outbox` (shown only when `NODE_ENV !== "production"`).

### Module 5 — Smart Image Handling
`/api/upload` route: auth-gated multipart POST, MIME allowlist (JPEG/PNG/WebP only), sharp compression (cover ≤1920px@q82, gallery ≤1280px@q80). `ImageFrameEditor` client component: file picker → canvas preview → drag to reposition + range slider for zoom → "Salva immagine" crops to canvas blob → uploads to `/api/upload` → calls `onChange(url)`. `GalleryEditor`: list of 4:3 frame editors with HTML5 drag-to-reorder and remove. Both wired into `ProjectForm` (cover 16:10 + gallery 4:3); cover URL stored in hidden input and read by `saveProjectAction`.

---

## 7. What is LEFT (Modules 6–7)

### Module 6 — Preview, Dev U/A Switch, SEO & Polish

**Not started.** All items below need to be built:

1. **Preview button** (`/admin/progetti/[id]/edit`)
   - Add an "Anteprima" `<a target="_blank">` button next to the save button in the project editor
   - For published projects: opens `/progetti/[slug]` directly
   - For unpublished projects: generate a short-lived HMAC-SHA256 signed token (signed with `SESSION_SECRET`, 1-hour expiry) and append as `?preview_token=<token>` to the URL
   - In `/app/(public)/progetti/[slug]/page.tsx`: if `preview_token` search param is present and valid, fetch the project without the `published: true` guard; if invalid/expired, fall through to `notFound()`
   - Suggested token format: `base64url("${slug}:${expires_unix}:${hmac_hex}")`

2. **DevSwitcher component** (`components/DevSwitcher.tsx`)
   - Create with a prominent `/* DEV-ONLY — remove or set DEV_UA_SWITCH=false before production */` comment block
   - Fixed bottom-right pill: "👤 Visitatore" button → `/` and "🔑 Admin" button → `/admin`
   - Highlight the active side based on `usePathname()`
   - Render in `app/layout.tsx` only when `process.env.DEV_UA_SWITCH === "true"`
   - Must be completely absent (not just hidden) when the env var is false/unset — use a server-side env check to conditionally import/render

3. **Sitemap** (`app/sitemap.ts`)
   - Next.js `MetadataRoute.Sitemap` format
   - Static pages: `/`, `/progetti`, `/contatti`
   - Dynamic: one entry per published project (`/progetti/[slug]`)
   - Base URL from `NEXT_PUBLIC_SITE_URL ?? "https://deroarts.com"`

4. **robots.txt** (`app/robots.ts`)
   - Allow `*` for `/`
   - Disallow `/admin`
   - Point sitemap to `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`

5. **404 page** (`app/not-found.tsx`)
   - Italian language: "Pagina non trovata" + friendly message
   - Links back to Home and Progetti
   - Brand styling (graphite background or light surface)

6. **Error boundary** (`app/error.tsx`)
   - `"use client"` required by Next.js
   - Italian "Qualcosa è andato storto" heading
   - "Riprova" reset button calling `reset()`
   - Minimal branded styling

7. **Responsive audit**
   - Test all public pages at 375px (iPhone SE), 768px (tablet), 1280px desktop
   - Fix any horizontal scroll, text overflow, or touch-target issues
   - Admin drawer should open/close smoothly on mobile; main content must not be hidden behind sidebar on small screens

8. **Open Graph image**
   - The current OG image points to an SVG logo which many crawlers reject
   - Create or reference a PNG/JPG fallback at `public/brand/og-image.png` (1200×630)
   - Update `app/layout.tsx` metadata to point `og:image` to the PNG

### Module 7 — Handoff & Devin Config

Now partially done (this document). Remaining:
- Write `docs/DEVIN.md` with Devin-specific task instructions and file pointers
- Add a `devin.toml` or equivalent config if Devin requires it
- Confirm all tasks from Module 6 are testable end-to-end

---

## 8. Known Cleanup Items / Tech Debt

| Item | Priority | Notes |
|---|---|---|
| **`pnpm-workspace.yaml` leftover** | Low | File at repo root declares `packages: []`. It's a harmless remnant of the original monorepo scaffold but can confuse tooling. Delete it or leave `packages: []` as a no-op. |
| **`public/uploads/` not in `.gitignore`** | Medium | User-uploaded images will be committed to git, bloating history. Add `public/uploads/*` to `.gitignore` and a `public/uploads/.gitkeep` to preserve the directory. Task #13 (proposed). |
| **Orphan images on disk** | Medium | When a project's cover or gallery image is replaced, the old file in `public/uploads/` is never deleted. `LocalStorageAdapter.delete()` is already implemented — wire it in `saveProjectAction` (compare old vs new URLs, delete old `/uploads/` paths). Task #12 (proposed). |
| **Wire Supabase Storage** | High (for deploy) | `LocalStorageAdapter` writes to `public/uploads/` which is ephemeral on Render/Supabase deployments. Implement `SupabaseStorageAdapter` and set `STORAGE_MODE=supabase`. |
| **Wire real SMTP (Zoho)** | High (for deploy) | `FakeMailAdapter` never delivers mail to users. Implement `SmtpMailAdapter` with Nodemailer and set `MAIL_MODE=smtp`. |
| **Wire Supabase Auth** | Medium (for deploy) | `CookieAuthAdapter` uses env-var credentials which is fine for a single admin. For multi-user or OAuth, implement `SupabaseAuthAdapter`. |
| **Supabase RLS policies** | High (for deploy) | If using Supabase Postgres directly from the client, all tables need Row Level Security policies. Server-side Prisma with service role bypasses RLS — ensure service role key is never exposed to the browser. |
| **`/admin/dev-outbox` notFound() guard** | Low | Page should call `notFound()` when `MAIL_MODE !== "fake"` in production. Currently it renders an empty state instead of 404ing. |
| **Richieste page ignores `projectId` filter** | Low | The admin requests list has a `projectId` URL param that the page silently ignores — per-project filtering is not wired. |
| **OG image is an SVG** | Low-Medium | `app/(public)/page.tsx` uses the horizontal logo SVG as `og:image`. Most crawlers only support PNG/JPG. Add a `public/brand/og-image.png` (1200×630) and update references. |
| **Image size budget not enforced** | Low | Upload API uses fixed resize+quality settings; noisy images can exceed the 200 KB cover / 150 KB gallery targets. Add iterative quality reduction in `/api/upload` if strict size budget is required. |
| **`/admin/impostazioni` is a placeholder** | Low | Settings page renders "Impostazioni placeholder". Planned content: site title/description, contact email, social links, stored in a `Settings` DB model. Task #10 (existing). |

---

## 9. Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Apply migrations
npx prisma migrate deploy

# 4. (Optional) Seed sample data
npx prisma db seed

# 5. Start dev server
pnpm run dev
# → http://localhost:3000
# → Admin: http://localhost:3000/admin/login
#   Email: admin@deroarts.com  Password: (from ADMIN_PASSWORD)
```

**Sharp** (image compression) is installed as a native dependency (`sharp@0.35.2`). It compiles native bindings on first install — this is expected and may take 30–60 seconds.

---

## 10. Deploy Checklist (when ready)

- [ ] Set `STORAGE_MODE=supabase` and implement `SupabaseStorageAdapter`
- [ ] Set `MAIL_MODE=smtp` and implement `SmtpMailAdapter`
- [ ] Set `ADMIN_PASSWORD` to a bcrypt hash (`bcrypt.hashSync("password", 12)`)
- [ ] Set `SESSION_SECRET` to a 32+ character random string (`openssl rand -base64 32`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] Ensure `DEV_UA_SWITCH` is absent or `false`
- [ ] Run `npx prisma migrate deploy` against production DB
- [ ] Add `public/uploads/*` to `.gitignore` (local adapter not used in prod)
- [ ] Configure Supabase Storage bucket with public read, private write
- [ ] Set Supabase RLS policies on all tables (deny by default, allow service role)
- [ ] Verify OG image (`og:image`) is a PNG/JPG, not SVG
