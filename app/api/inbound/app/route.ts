import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { sendPushToAll } from "@/lib/push/send";

export const dynamic = "force-dynamic";

// ─── Endpoint notifiche dalle app dei progetti ────────────────────────────────
// Un'app esterna (es. Stickers) invia qui una notifica ("nuovo ordine", ecc.):
// la salviamo come messaggio nella sezione Messaggi di DeroArts. Nessuna email
// di mezzo → nessun limite Zoho. Auth con chiave dedicata DEROARTS_APP_KEY.
//
// POST /api/inbound/app
//   header: x-api-key: <DEROARTS_APP_KEY>
//   body JSON: {
//     project?: string,      // slug del progetto in DeroArts (facoltativo)
//     from_name?: string,    // chi/che cosa ha generato la notifica
//     from_email?: string,   // email di riferimento per rispondere (facoltativa)
//     subject?: string,      // oggetto breve
//     message: string        // testo della notifica (obbligatorio)
//   }

function isAuthorized(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  const expected = process.env.DEROARTS_APP_KEY;
  return Boolean(expected) && key === expected;
}

export async function POST(request: NextRequest) {
  if (!process.env.DEROARTS_APP_KEY) {
    return NextResponse.json(
      { error: "Endpoint non configurato (DEROARTS_APP_KEY mancante)." },
      { status: 500 }
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  let body: {
    project?: unknown;
    from_name?: unknown;
    from_email?: unknown;
    subject?: unknown;
    message?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON non valido." }, { status: 400 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const message = str(body.message, 20000);
  if (!message) {
    return NextResponse.json(
      { error: "Il campo 'message' è obbligatorio." },
      { status: 400 }
    );
  }

  const projectSlug = str(body.project, 200).toLowerCase();
  const fromName = str(body.from_name, 200) || "Notifica app";
  const fromEmailRaw = str(body.from_email, 200).toLowerCase();
  // Validazione minima dell'email (se fornita): deve contenere una @.
  const fromEmail = fromEmailRaw.includes("@") ? fromEmailRaw : "";
  const subject = str(body.subject, 300);

  // Risolvi il progetto dallo slug (se passato e valido).
  let projectId: string | null = null;
  if (projectSlug) {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true },
    });
    projectId = project?.id ?? null;
  }

  await prisma.request.create({
    data: {
      name: fromName,
      // `email` non è nullable: se manca, usiamo un placeholder di sistema.
      email: fromEmail || "notifica@app.deroarts.com",
      reply_to_email: fromEmail || null,
      subject: subject || null,
      message,
      project_id: projectId,
      source: "email", // stessa origine "non-form"; il badge Email va bene
      status: "new",
    },
  });

  await sendPushToAll({
    title: subject
      ? `Notifica app — ${subject.slice(0, 40)}`
      : "Nuova notifica da un'app",
    body: `${fromName}: ${message.slice(0, 90)}${message.length > 90 ? "…" : ""}`,
    url: "/admina/messaggi",
    tag: "deroarts-app",
  });

  return NextResponse.json({ ok: true });
}
