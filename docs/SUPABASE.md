# DeroArts — Supabase Migration Guide

**For:** Devin (next-phase developer)
**Purpose:** Step-by-step reference for moving from Replit Postgres + local file storage to Supabase Postgres + Supabase Storage.

---

## 1. Database Schema

All tables are created via Prisma migrations — Supabase is just the Postgres host.

### Enums

```sql
CREATE TYPE "ProjectStatus" AS ENUM ('available', 'coming_soon', 'demo_available');
CREATE TYPE "ActionType"    AS ENUM ('demo', 'request_info', 'download', 'app_store', 'play_store', 'external');
CREATE TYPE "RequestStatus" AS ENUM ('new', 'read', 'handled');
```

### Tables

#### `categories`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `TEXT` | PK, default `cuid()` | |
| `name` | `JSONB` | NOT NULL | Shape: `{ "it": "...", "en": "" }` |
| `slug` | `TEXT` | UNIQUE, NOT NULL | URL-safe identifier |
| `sort_order` | `INTEGER` | NOT NULL, default `0` | Ascending order |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |

Indexes: `categories_slug_idx` on `(slug)`

#### `projects`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `TEXT` | PK, default `cuid()` | |
| `slug` | `TEXT` | UNIQUE, NOT NULL | URL path segment |
| `title` | `JSONB` | NOT NULL | Shape: `{ "it": "...", "en": "" }` |
| `short_description` | `JSONB` | NOT NULL | One-line summary, JSONB |
| `long_description` | `JSONB` | NOT NULL | Multi-paragraph body, JSONB |
| `status` | `"ProjectStatus"` | NOT NULL, default `'available'` | Enum |
| `category_id` | `TEXT` | FK → `categories.id`, SetNull on delete | Nullable |
| `cover_image_url` | `TEXT` | Nullable | `/uploads/…` (local) or Supabase CDN URL |
| `gallery` | `JSONB` | NOT NULL, default `'[]'` | Array: `[{ url: string, alt: { it: string, en: string } }]` |
| `published` | `BOOLEAN` | NOT NULL, default `false` | Only published rows appear on public site |
| `sort_order` | `INTEGER` | NOT NULL, default `0` | |
| `from_email` | `TEXT` | Nullable | Per-project reply-from; falls back to `info@deroarts.com` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, auto-updated | |

Indexes: `projects_slug_idx`, `projects_category_id_idx`, `projects_status_idx`, `projects_published_idx`

#### `project_actions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `TEXT` | PK, default `cuid()` | |
| `project_id` | `TEXT` | FK → `projects.id`, Cascade on delete | |
| `type` | `"ActionType"` | NOT NULL | Enum |
| `label` | `JSONB` | NOT NULL | Shape: `{ "it": "...", "en": "" }` |
| `url` | `TEXT` | Nullable | `null` for `request_info` type |
| `enabled` | `BOOLEAN` | NOT NULL, default `true` | |
| `sort_order` | `INTEGER` | NOT NULL, default `0` | |

Indexes: `project_actions_project_id_idx`

#### `requests`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `TEXT` | PK, default `cuid()` | |
| `project_id` | `TEXT` | FK → `projects.id`, SetNull on delete | Nullable — `null` = general contact |
| `name` | `TEXT` | NOT NULL | Requester's name |
| `email` | `TEXT` | NOT NULL | Requester's email |
| `message` | `TEXT` | NOT NULL | Free-text message |
| `status` | `"RequestStatus"` | NOT NULL, default `'new'` | Enum |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `handled_at` | `TIMESTAMPTZ` | Nullable | Set when status → `handled` |

Indexes: `requests_project_id_idx`, `requests_status_idx`

#### `dev_outbox`
| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT` | PK, cuid() |
| `to` | `TEXT` | Recipient address |
| `from` | `TEXT` | Sender address |
| `subject` | `TEXT` | Email subject |
| `body` | `TEXT` | Full HTML body |
| `created_at` | `TIMESTAMPTZ` | |

> **Note:** `dev_outbox` is used only when `MAIL_MODE=fake`. In production this table exists but is never written to. It is safe to leave in the schema.

---

## 2. JSONB Field Shapes

All translatable text fields store a JSON object with language keys. The app currently renders only the `it` (Italian) value; `en` is always an empty string and reserved for future i18n.

```json
// Translatable text (title, short_description, long_description, name, label)
{ "it": "Il tuo testo in italiano", "en": "" }

// Gallery (projects.gallery column)
[
  {
    "url": "https://cdn.supabase.co/storage/v1/object/public/deroarts-assets/gallery/abc.jpg",
    "alt": { "it": "Descrizione dell'immagine", "en": "" }
  }
]
```

---

## 3. Supabase Storage Bucket Plan

### Bucket name: `deroarts-assets`

| Folder | Purpose | Example path |
|---|---|---|
| `covers/` | Project cover images (16:10, JPEG, ≤1920px) | `covers/1751234567890-a1b2c3d4.jpg` |
| `gallery/` | Gallery images (4:3, JPEG, ≤1280px) | `gallery/1751234567891-e5f6g7h8.jpg` |

**Bucket settings:**
- **Public:** Yes (images served directly via CDN URL)
- **Max file size:** 15 MB (enforced by `/api/upload` before reaching storage)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp` (enforced server-side)

The CDN URL format for Supabase public buckets:
```
https://<project-id>.supabase.co/storage/v1/object/public/deroarts-assets/<path>
```

---

## 4. Migration Procedure

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **project URL** (`https://<id>.supabase.co`) and **service role key** (Settings → API)
3. In Database → Connection String, copy the **Transaction mode** pooler URL (port 6543) or the **Session mode** URL (port 5432)
   - For Prisma with long-lived connections: use **Session mode** (port 5432)

### Step 2 — Migrate the database

```bash
# 1. Set the Supabase connection string
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# 2. Apply all Prisma migrations to the new DB
npx prisma migrate deploy

# 3. (Optional) Seed initial data
npx prisma db seed
```

> Prisma `migrate deploy` applies all pending migrations from `prisma/migrations/` in order. It does not re-run already-applied migrations.

### Step 3 — Create the storage bucket

In the Supabase dashboard:
1. Storage → New bucket → name: `deroarts-assets`, public: ✅
2. Add bucket policy: allow public read on all objects

Or via SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('deroarts-assets', 'deroarts-assets', true);
```

### Step 4 — Implement `SupabaseStorageAdapter`

Create `lib/adapters/storage-supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { StorageAdapter } from "./storage";

export class SupabaseStorageAdapter implements StorageAdapter {
  private client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  private bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "deroarts-assets";

  async upload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = originalName.split(".").pop() ?? "jpg";
    const folder = originalName.includes("cover") ? "covers" : "gallery";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(url: string): Promise<void> {
    // Extract path from CDN URL: ...public/<bucket>/<path>
    const marker = `/public/${this.bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await this.client.storage.from(this.bucket).remove([path]);
  }
}
```

Install the Supabase JS client if not already present:
```bash
pnpm add @supabase/supabase-js
```

### Step 5 — Wire the adapter

In `lib/adapters/index.ts`, add the Supabase case:

```typescript
import { SupabaseStorageAdapter } from "./storage-supabase";
// ...
case "supabase":
  _storage = new SupabaseStorageAdapter();
  break;
```

Update the error message in the `default` branch to include `"supabase"`.

### Step 6 — Migrate existing images (if any)

If local uploads exist in `public/uploads/`, they need to be copied to Supabase Storage and the URLs in the DB updated. Write a one-off migration script:

```typescript
// scripts/migrate-uploads.ts
import { prisma } from "@/lib/db/client";
import { SupabaseStorageAdapter } from "@/lib/adapters/storage-supabase";
import fs from "fs/promises";
import path from "path";

const storage = new SupabaseStorageAdapter();

const projects = await prisma.project.findMany();
for (const p of projects) {
  if (p.cover_image_url?.startsWith("/uploads/")) {
    const file = await fs.readFile(path.join("public", p.cover_image_url));
    const newUrl = await storage.upload(file, `cover-${p.slug}.jpg`, "image/jpeg");
    await prisma.project.update({ where: { id: p.id }, data: { cover_image_url: newUrl } });
    console.log(`Migrated cover: ${p.slug} → ${newUrl}`);
  }
  // TODO: repeat for gallery items
}
```

---

## 5. Row Level Security (RLS)

The app uses Prisma with the **service role key** (server-side only). Prisma connections bypass RLS, so policies are not strictly required for the current architecture.

However, as a defence-in-depth measure, add the following policies **after** migration:

```sql
-- Enable RLS on all tables
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_outbox     ENABLE ROW LEVEL SECURITY;

-- Public read-only access to published projects and categories
CREATE POLICY "public_read_published_projects"
  ON projects FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "public_read_categories"
  ON categories FOR SELECT TO anon USING (true);

CREATE POLICY "public_read_published_actions"
  ON project_actions FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND published = true));

-- Deny everything else for anon; service role bypasses RLS automatically
```

> **Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is server-only. Only `NEXT_PUBLIC_SITE_URL` and (if using Supabase Auth later) `SUPABASE_ANON_KEY` are safe to expose publicly.
