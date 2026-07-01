# DeroArts

A public showcase/storefront for small software and apps ("gestionali" and utilities), where visitors browse products, try demos, and request information. Plus a private admin for the owner to publish projects and manage requests. Official domain: deroarts.com.

## Run & Operate

- `pnpm run dev` — start the Next.js dev server (port 3000)
- `pnpm run build` — production build
- `pnpm run typecheck` — TypeScript check
- `pnpm run db:migrate` — run Prisma migrations (dev)
- `pnpm run db:generate` — regenerate Prisma client after schema changes
- `pnpm run db:seed` — seed the database with example data
- `pnpm run db:studio` — open Prisma Studio
- Required env: see `.env.example` for the full list

## Stack

- **Framework:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS with DeroArts brand tokens; Poppins font
- **ORM:** Prisma + PostgreSQL (Supabase-ready; JSONB for multilingual fields)
- **Auth:** Email + password, signed httpOnly session cookie (`iron-session`)
- **Adapters:** Storage (`local`/`supabase`), Mail (`fake`/`smtp`) — selected by env var
- **Image processing:** `sharp` (compression on upload)

## Where things live

- `app/` — Next.js App Router (all routes)
- `app/(public)/` — public-facing pages (home, projects, contact)
- `app/admin/` — protected admin area
- `components/` — shared React components
- `lib/adapters/` — swappable storage, mail, auth adapters
- `lib/db/` — Prisma client singleton
- `prisma/` — schema, migrations, seed script
- `public/brand/` — logo SVGs, favicon (horizontal light/dark, symbol, favicon)
- `public/uploads/` — local dev image storage (gitignored)

## Architecture decisions

- **JSONB for multilingual fields**: all text content uses `{ "it": "...", "en": "" }` shape for zero-rework Supabase migration. Admin fills `it`; `en` stays empty.
- **Adapter pattern**: storage, mail, and auth are interfaces with swappable implementations. Switching dev→prod is an env-var change, not a code change.
- **No Replit lock-in**: standard Next.js at the repo root, portable to Render/any Node host.
- **Single owner auth**: credentials from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars; no user table needed now.
- **Dev U/A switch**: `DevSwitcher` component rendered only when `DEV_UA_SWITCH=true`. Must never be enabled in production.

## Product

Public: Home · Projects (filterable grid) · Project detail (gallery, action buttons) · Contact/Info.
Admin (`/admin`): Projects CRUD · Categories CRUD · Requests inbox (with unread bell) · Dev Outbox (fake emails).

## User preferences

- UI language: Italian (public + admin)
- Public content schema is multilingual-ready (it/en), English fields empty for now
- No PWA, no Expo/React Native — public site is a normal responsive website
- No Replit-specific dependencies
- Admin is a protected route, not an installable app

## Gotchas

- **next.config must be `.mjs`** — Next.js 14 does not support `next.config.ts`
- **Prisma generate** must be re-run after any schema change: `pnpm run db:generate`
- **Tailwind content** — only scan `app/` and `components/`, not `lib/` (avoids performance issues with monorepo lib packages at root)
- `public/uploads/` is gitignored — local dev storage only; swap to Supabase Storage in prod via `STORAGE_MODE=supabase`
- `DEV_UA_SWITCH=true` must never reach production — the switcher bypasses auth
