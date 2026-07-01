import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStorageAdapter } from "@/lib/adapters";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PURPOSE_CONFIG = {
  cover: { maxWidth: 1920, quality: 82 },
  gallery: { maxWidth: 1280, quality: 80 },
} as const;

export async function POST(request: NextRequest) {
  // Auth guard — only admin sessions may upload
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string | null) ?? "gallery";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nessun file fornito." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo di file non supportato. Usa JPEG, PNG o WebP." },
        { status: 400 }
      );
    }

    // 15 MB hard cap
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File troppo grande (max 15 MB)." },
        { status: 400 }
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const cfg = PURPOSE_CONFIG[purpose as keyof typeof PURPOSE_CONFIG] ?? PURPOSE_CONFIG.gallery;

    // Server-side compression via sharp (catches any oversized canvas blobs)
    const sharp = (await import("sharp")).default;
    const compressed = await sharp(raw)
      .rotate() // honour EXIF orientation
      .resize(cfg.maxWidth, undefined, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: cfg.quality, progressive: true })
      .toBuffer();

    const storage = getStorageAdapter();
    const url = await storage.upload(compressed, `upload-${Date.now()}.jpg`, "image/jpeg");

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[api/upload] Error:", err);
    return NextResponse.json(
      { error: "Errore durante il caricamento. Riprova." },
      { status: 500 }
    );
  }
}
