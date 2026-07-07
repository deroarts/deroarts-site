import { NextRequest, NextResponse } from "next/server";
import { getStorageAdapter } from "@/lib/adapters";
import { validateUpload, compressImage } from "@/lib/image";

// External-agent image upload (e.g. Devin). Request-time only.
export const dynamic = "force-dynamic";

// Same shared-secret guard as the projects endpoint (route is outside middleware).
function isAuthorized(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  const expected = process.env.AGENT_API_KEY;
  return Boolean(expected) && key === expected;
}

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
    const purpose = formData.get("purpose") as string | null;

    const invalid = validateUpload(file);
    if (invalid) {
      return NextResponse.json({ error: invalid.error }, { status: invalid.status });
    }

    const raw = Buffer.from(await file!.arrayBuffer());
    const compressed = await compressImage(raw, purpose);

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
