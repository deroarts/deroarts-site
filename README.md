# DeroArts

A public showcase/storefront for small software and apps ("gestionali" and utilities), where visitors browse products, try demos, and request information. Plus a private admin for the owner to publish projects and manage requests. Official domain: deroarts.com.

## Run & Operate

- `pnpm run dev` — start the Next.js dev server (port 3000, or `PORT=5001 pnpm dev`)
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
- **ORM:** Prisma + PostgreSQL (Supabase; JSONB for multilingual fields)
- **Auth:** iron-session (single owner admin account)
- **Deploy target:** Render (standard Next.js at the repo root, portable to any Node host)

## Operational context (DNA)

Full operational context for developers/agents lives in [`DNA/`](DNA/00-indice.md) — start from `DNA/00-indice.md`.

## Notes

- Multilingual text fields use JSON with shape `{ "it": "...", "en": "" }`.
- Storage and mail use adapters (`STORAGE_MODE`, `MAIL_MODE`): local/fake in dev, Supabase/SMTP in production.
