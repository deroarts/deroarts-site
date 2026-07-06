import { NextRequest, NextResponse } from "next/server";
import { getStorageAdapter } from "@/lib/adapters";

// External-agent image upload (e.g. Devin). Request-time only.
export const dynamic = "force-dynamic";

// Same shared-secret guard as the projects endpoint (route is outside middleware).
function isAuthorized(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  const expected = process.env.AGENT_API_KEY;
  return Boolean(expected) && key === expected;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// cover = larger (hero), gallery = standard — mirrors app/api/upload/route.ts.
const PURPOSE_CONFIG = {
  cover: { maxWidth: 1920, quality: 82 },
  gallery: { maxWidth: 1280, quality: 80 },
} as const;

// ── POST: upload ONE image, return its permanent public URL ─────────────────
// The agent uploads each screenshot/logo here first, then passes the returned
// URLs to POST /api/agent/projects. Files are stored on Supabase Storage (a
// public bucket) so the URL survives redeploys. Content only — no layout.
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string | null) ?? "gallery";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nessun file fornito (campo 'file')." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo di file non supportato. Usa JPEG, PNG o WebP." },
        { status: 400 }
      );
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File troppo grande (max 15 MB)." }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const cfg = PURPOSE_CONFIG[purpose as keyof typeof PURPOSE_CONFIG] ?? PURPOSE_CONFIG.gallery;

    // Server-side compression (same pipeline as the admin upload).
    const sharp = (await import("sharp")).default;
    const compressed = await sharp(raw)
      .rotate()
      .resize(cfg.maxWidth, undefined, { withoutEnlargement: true, fit: "inside" })
      .jpeg({ quality: cfg.quality, progressive: true })
      .toBuffer();

    const storage = getStorageAdapter();
    const url = await storage.upload(compressed, `agent-${Date.now()}.jpg`, "image/jpeg");

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[api/agent/upload] Error:", err);
    return NextResponse.json(
      { error: "Errore durante il caricamento dell'immagine." },
      { status: 500 }
    );
  }
}
