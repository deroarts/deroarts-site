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
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // File may already be gone — not an error
    }
  }
}
