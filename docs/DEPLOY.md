# DeroArts — Deployment Guide (Render + Supabase)

**For:** Devin (next-phase developer)
**Target stack:** Render web service (Next.js) + Supabase (Postgres + Storage)

---

## 1. Prerequisites

Before deploying:
- [ ] Supabase project created and schema migrated (see `docs/SUPABASE.md`)
- [ ] Storage bucket `deroarts-assets` created (public)
- [ ] `SupabaseStorageAdapter` implemented and wired in `lib/adapters/index.ts`
- [ ] `SmtpMailAdapter` implemented and wired in `lib/adapters/index.ts` (see §4)
- [ ] Domain `deroarts.com` ready to point to Render

---

## 2. Render Web Service Configuration

### Build settings

| Setting | Value |
|---|---|
| **Environment** | Node |
| **Build command** | `pnpm install && pnpm run build` |
| **Start command** | `node .next/standalone/server.js` |
| **Node version** | 20.x |

> The app uses `output: "standalone"` in `next.config.mjs`, which produces a self-contained server in `.next/standalone/`. Do **not** use `pnpm start` — it tries to run the full Next.js dev server.

### Static files

Render's standalone output does not copy `public/` automatically. Add a build step or configure Render's static file serving:

```bash
# Add to build command (after pnpm run build):
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

Or set up a separate Render static site for `public/` + `.next/static/` if using a CDN.

### Health check

| Setting | Value |
|---|---|
| **Health check path** | `/` |
| **Port** | `3000` (Render injects `PORT` automatically; the app reads it) |

---

## 3. Environment Variables

Set all of the following in Render → Environment (or an Environment Group shared across services).

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | Secret | ✅ | — | Supabase Postgres connection string (Session mode, port 5432) |
| `SESSION_SECRET` | Secret | ✅ | — | ≥32 random chars for iron-session. Generate: `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Env | ✅ | — | Admin login email (single owner) |
| `ADMIN_PASSWORD` | Secret | ✅ | — | Bcrypt hash of admin password. Generate: `node -e "console.log(require('bcryptjs').hashSync('yourpass',12))"` |
| `MAIL_MODE` | Env | ✅ | `fake` | `smtp` in production |
| `SMTP_HOST` | Env | when smtp | `smtp.zoho.com` | Zoho SMTP host |
| `SMTP_PORT` | Env | when smtp | `465` | TLS port |
| `SMTP_USER` | Env | when smtp | — | `info@deroarts.com` |
| `SMTP_PASS` | Secret | when smtp | — | Zoho app-specific password |
| `MAIL_FROM` | Env | when smtp | `info@deroarts.com` | Default sender address |
| `STORAGE_MODE` | Env | ✅ | `local` | `supabase` in production |
| `SUPABASE_URL` | Env | when supabase | — | `https://<id>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | when supabase | — | Service role key (never expose to browser) |
| `SUPABASE_STORAGE_BUCKET` | Env | when supabase | `deroarts-assets` | Storage bucket name |
| `NEXT_PUBLIC_SITE_URL` | Env | ✅ | `https://deroarts.com` | Base URL, no trailing slash. Exposed to browser. |
| `DEV_UA_SWITCH` | Env | dev only | unset | Set `true` in local dev only. **Must be absent or `false` in production.** |

> **Security rule:** Variables prefixed `NEXT_PUBLIC_` are bundled into the client JS. Only `NEXT_PUBLIC_SITE_URL` is currently public-prefixed. Never add `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, or `ADMIN_PASSWORD` with the `NEXT_PUBLIC_` prefix.

---

## 4. Adapter Flip — Dev → Production

### Storage: `local` → `supabase`

1. Set `STORAGE_MODE=supabase`
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
3. Ensure `SupabaseStorageAdapter` is implemented (see `docs/SUPABASE.md §4`)
4. Run the one-off upload migration script if local images exist

### Mail: `fake` → `smtp`

1. Set `MAIL_MODE=smtp`
2. Implement `SmtpMailAdapter` in `lib/adapters/mail-smtp.ts`:

```typescript
import nodemailer from "nodemailer";
import type { MailAdapter, MailMessage } from "./mail";

export class SmtpMailAdapter implements MailAdapter {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.zoho.com",
    port: parseInt(process.env.SMTP_PORT ?? "465"),
    secure: true, // TLS on port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}
```

3. Install Nodemailer: `pnpm add nodemailer && pnpm add -D @types/nodemailer`
4. Add `case "smtp": _mail = new SmtpMailAdapter(); break;` in `lib/adapters/index.ts`

#### Zoho SMTP settings

| Setting | Value |
|---|---|
| **Host** | `smtp.zoho.com` (EU accounts: `smtp.zoho.eu`) |
| **Port** | `465` |
| **Security** | SSL/TLS |
| **Username** | `info@deroarts.com` |
| **Password** | App-specific password (Zoho account → Security → App passwords) |

> **Do not** use your main Zoho account password. Create an app-specific password in Zoho's security settings. Standard SMTP passwords won't work with 2FA enabled.

### Auth: cookie → Supabase Auth (future, optional)

The current `CookieAuthAdapter` is sufficient for a single-owner app. If multi-user or OAuth login is needed later:

1. Create `lib/auth/supabase-adapter.ts` implementing `AuthAdapter` using `@supabase/supabase-js`
2. Update `lib/auth/index.ts` factory to return it based on an `AUTH_ADAPTER=supabase` env var
3. The `middleware.ts` reads from `getSession()` — it will work unchanged if the adapter returns a compatible `SessionData` shape

---

## 5. First Deploy Checklist

```
[ ] Run npx prisma migrate deploy against Supabase DB
[ ] Run npx prisma db seed (optional — adds sample data)
[ ] Verify DATABASE_URL uses Session mode (port 5432), not Transaction mode
[ ] Set SESSION_SECRET to a fresh random value (not the dev value)
[ ] Set ADMIN_PASSWORD to a bcrypt hash, not plain text
[ ] Set MAIL_MODE=smtp and configure Zoho credentials
[ ] Set STORAGE_MODE=supabase and configure Supabase credentials
[ ] Set NEXT_PUBLIC_SITE_URL=https://deroarts.com
[ ] Ensure DEV_UA_SWITCH is absent or set to "false"
[ ] Verify /robots.txt disallows /admin
[ ] Verify /sitemap.xml lists published projects
[ ] Test admin login at https://deroarts.com/admin/login
[ ] Test request form — verify email arrives in real inbox
[ ] Test image upload — verify file appears in Supabase Storage bucket
[ ] Point deroarts.com DNS to Render
```

---

## 6. Free-Tier Constraints

### Render (free tier)
| Constraint | Value | Mitigation |
|---|---|---|
| **Sleep on idle** | Spins down after 15 min of inactivity; cold start ~30s | Upgrade to Starter ($7/mo) or use an uptime ping service |
| **Build minutes** | 500/month | Sufficient for small projects; Next.js builds ~2–3 min |
| **Bandwidth** | 100 GB/month | Fine for a small portfolio; images served from Supabase CDN reduce this |

### Supabase (free tier)
| Constraint | Value | Notes |
|---|---|---|
| **Database storage** | 500 MB | Well above needs for text content |
| **Storage** | 1 GB | ~3,000–5,000 compressed JPEG images at 200KB each |
| **Bandwidth** | 5 GB/month | CDN-served images don't count toward this |
| **Pause on idle** | Project pauses after 1 week of inactivity | Upgrade to Pro ($25/mo) or keep active |
| **Max connections** | 60 direct / 200 via pooler | Use the pooler URL in `DATABASE_URL` |

### Image compression targets (already implemented in `/api/upload`)
| Type | Max width | JPEG quality | Target size |
|---|---|---|---|
| Cover (16:10) | 1920px | 82 | ≤200 KB |
| Gallery (4:3) | 1280px | 80 | ≤150 KB |

These targets are enforced by `sharp` in `app/api/upload/route.ts`.

---

## 7. Known Issues & Tech Debt

See `docs/HANDOFF.md §8` for the full list. The highest-priority items before going live:

1. **`public/uploads/` not in `.gitignore`** — add `public/uploads/*` + `public/uploads/.gitkeep` to prevent accidental commit of uploaded images
2. **Orphan images** — when a project image is replaced, the old file is not deleted. Wire `getStorageAdapter().delete(oldUrl)` in `saveProjectAction` for both cover and gallery
3. **`/admin/dev-outbox` in production** — the page renders (empty) in production; it should call `notFound()` when `MAIL_MODE !== "fake"`
