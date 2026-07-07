import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { prisma } from "@/lib/db/client";
import { sendPushToAll } from "@/lib/push/send";
import { parseFrom, aliasLocalPart, bodyToText } from "@/lib/inbound/parse";
import { threadKey } from "@/lib/inbound/thread";

export const dynamic = "force-dynamic";

// ─── Resend Inbound webhook ───────────────────────────────────────────────────
// Riceve l'evento `email.received` quando una mail arriva su un indirizzo
// @deroarts.com (l'MX del dominio punta direttamente a Resend). Verifica la firma,
// scarica il corpo, e salva la mail come messaggio nella tabella `requests` (source=email).

interface EmailReceivedPayload {
  type: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    received_for?: string[];
    subject?: string;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const raw = await request.text();

  // 1) Verifica firma (standardwebhooks / svix headers). Se il secret non è
  //    configurato, rifiuta: non accettiamo webhook non verificati.
  if (!secret) {
    console.error("[inbound] RESEND_WEBHOOK_SECRET mancante");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  let payload: EmailReceivedPayload;
  try {
    const wh = new Webhook(secret);
    payload = wh.verify(raw, {
      "webhook-id": request.headers.get("svix-id") ?? request.headers.get("webhook-id") ?? "",
      "webhook-timestamp":
        request.headers.get("svix-timestamp") ?? request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature":
        request.headers.get("svix-signature") ?? request.headers.get("webhook-signature") ?? "",
    }) as EmailReceivedPayload;
  } catch (e) {
    console.error("[inbound] firma non valida:", e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // 2) Ci interessa solo email.received.
  if (payload.type !== "email.received" || !payload.data?.email_id) {
    return NextResponse.json({ ok: true, ignored: payload.type });
  }

  const emailId = payload.data.email_id;

  // 3) Idempotenza: se già salvata, esci subito (il webhook può ritentare).
  const existing = await prisma.request.findUnique({
    where: { inbound_email_id: emailId },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  // 4) Scarica il contenuto completo (il webhook porta solo i metadati).
  let full: {
    from: string;
    subject: string;
    text: string | null;
    html: string | null;
    received_for: string[];
    to: string[];
  };
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.receiving.get(emailId);
    if (res.error || !res.data) {
      throw new Error(res.error?.message ?? "no data");
    }
    full = {
      from: res.data.from,
      subject: res.data.subject ?? "",
      text: res.data.text,
      html: res.data.html,
      received_for: res.data.received_for ?? [],
      to: res.data.to ?? [],
    };
  } catch (e) {
    console.error("[inbound] impossibile scaricare la mail", emailId, e);
    // 500 → Resend riproverà più tardi (la mail resta salvata da loro).
    return NextResponse.json({ error: "Fetch failed." }, { status: 500 });
  }

  // 5) Mittente + progetto (dall'alias destinatario) + testo.
  const { name, email } = parseFrom(full.from);
  const local = aliasLocalPart(full.received_for, full.to); // es. "stickers"
  let projectId: string | null = null;
  if (local) {
    const project = await prisma.project.findFirst({
      where: { from_email: `${local}@deroarts.com` },
      select: { id: true, title: true },
    });
    projectId = project?.id ?? null;
  }
  const message = bodyToText(full.text, full.html);

  // 6) Salva come messaggio (origine email). Il check al punto 3 non è atomico:
  //    se il webhook ritenta in parallelo, due richieste possono superarlo entrambe.
  //    Il vincolo @unique su inbound_email_id fa da guardia finale: se scatta
  //    (P2002 = duplicato) trattiamo come già salvata → 200, senza ritentare né
  //    ricontare la quota/push.
  try {
    await prisma.request.create({
      data: {
        name,
        email,
        reply_to_email: email,
        subject: full.subject || null,
        message,
        project_id: projectId,
        source: "email",
        direction: "inbound",
        thread_key: threadKey(email, full.subject),
        status: "new",
        inbound_email_id: emailId,
      },
    });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[inbound] salvataggio fallito", emailId, e);
    // 500 → Resend riproverà (la mail è ancora salvata da loro).
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }

  // 7) Conteggio per l'alert di quota (email ricevuta).
  const { recordEmail } = await import("@/lib/mail/quota");
  await recordEmail("received");

  // 8) Notifica push (self-guarding: no-op se disattivate).
  await sendPushToAll({
    title: full.subject ? `Nuova email — ${full.subject.slice(0, 40)}` : "Nuova email",
    body: `${name}: ${message.slice(0, 90)}${message.length > 90 ? "…" : ""}`,
    url: "/admina/messaggi",
    tag: "deroarts-email",
  });

  return NextResponse.json({ ok: true });
}
