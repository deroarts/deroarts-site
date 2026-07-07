import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStorageAdapter } from "@/lib/adapters";
import { validateUpload, compressImage } from "@/lib/image";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Auth guard — only admin sessions may upload
  const session = await getSession();
  if (!session) {
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
