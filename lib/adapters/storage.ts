import fs from "fs";
import path from "path";
import crypto from "crypto";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface StorageAdapter {
  /** Upload a file buffer; returns the public URL stored in the DB. */
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<string>;
  /** Delete a file by its public URL. Silently ignores missing files. */
  delete(url: string): Promise<void>;
}

// ─── Local implementation ─────────────────────────────────────────────────────

export class LocalStorageAdapter implements StorageAdapter {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    _mimeType: string
  ): Promise<string> {
    const ext = path.extname(originalName).toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace(/^\/uploads\//, "");
    const filePath = path.resolve(this.uploadDir, filename);

    // Guard against path traversal — resolved path must stay inside uploadDir.
    if (!filePath.startsWith(path.resolve(this.uploadDir) + path.sep)) {
      console.warn("[LocalStorageAdapter] delete() rejected unsafe path:", url);
      return;
    }

    try {
      await fs.promises.unlink(filePath);
    } catch {
      // File may already be gone — not an error
    }
  }
}

// ─── Supabase Storage implementation ──────────────────────────────────────────
// Uses the Supabase Storage REST API directly (no supabase-js dependency).
// Files land in a PUBLIC bucket, so the stored URL is the public CDN URL and
// survives redeploys (unlike LocalStorageAdapter on ephemeral Render disks).

export class SupabaseStorageAdapter implements StorageAdapter {
  private readonly baseUrl: string;
  private readonly serviceKey: string;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!url || !key || !bucket) {
      throw new Error(
        "SupabaseStorageAdapter requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET."
      );
    }
    this.baseUrl = url.replace(/\/$/, "");
    this.serviceKey = key;
    this.bucket = bucket;
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<string> {
    const ext = path.extname(originalName).toLowerCase() || ".jpg";
    const objectPath = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;

    const res = await fetch(
      `${this.baseUrl}/storage/v1/object/${this.bucket}/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: this.serviceKey,
          Authorization: `Bearer ${this.serviceKey}`,
          "Content-Type": mimeType || "application/octet-stream",
          "cache-control": "public, max-age=31536000, immutable",
        },
        // Buffer → Uint8Array so fetch sends the raw bytes as the body.
        body: new Uint8Array(buffer),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Supabase upload failed (${res.status}): ${detail.slice(0, 200)}`);
    }

    // Public bucket → stable CDN URL, safe to store in the DB.
    return `${this.baseUrl}/storage/v1/object/public/${this.bucket}/${objectPath}`;
  }

  async delete(url: string): Promise<void> {
    // Only handle URLs that belong to this bucket; ignore anything else.
    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const objectPath = url.slice(idx + marker.length);
    if (!objectPath) return;

    try {
      await fetch(
        `${this.baseUrl}/storage/v1/object/${this.bucket}/${objectPath}`,
        {
          method: "DELETE",
          headers: {
            apikey: this.serviceKey,
            Authorization: `Bearer ${this.serviceKey}`,
          },
        }
      );
    } catch {
      // Best-effort delete — a missing object is not an error.
    }
  }
}
