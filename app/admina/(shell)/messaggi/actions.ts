"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth";
import { getMailAdapter } from "@/lib/adapters";
import { t } from "@/lib/i18n";
import { adminReplyHtml, adminReplySubject } from "@/lib/mail/templates";
import { threadKey } from "@/lib/inbound/thread";
import { RequestStatus } from "@prisma/client";

const DEFAULT_FROM = process.env.RESEND_FROM || "info@deroarts.com";

// Le rotte /admina/* sono già protette dal middleware. In sviluppo, con
// DEV_UA_SWITCH=true, non esiste una sessione (accesso libero per il DevSwitcher):
// in quel caso non richiediamo la sessione, coerentemente con le altre azioni
// admin. In produzione (DEV_UA_SWITCH assente) la sessione resta obbligatoria.
async function requireAdmin() {
  if (process.env.DEV_UA_SWITCH === "true") return;
  const session = await getSession();
  if (!session) throw new Error("Non autorizzato.");
}

/** Update the status of a message (new / read / handled). */
export async function updateRequestStatusAction(
  id: string,
  status: RequestStatus
) {
  await requireAdmin();
  await prisma.request.update({
    where: { id },
    data: {
      status,
      handled_at: status === "handled" ? new Date() : undefined,
    },
  });
  revalidatePath("/admina/messaggi");
  revalidatePath(`/admina/messaggi/${id}`);
}

/** Delete a message permanently. */
export async function deleteRequestAction(id: string) {
  await requireAdmin();
  await prisma.request.delete({ where: { id } });
  revalidatePath("/admina/messaggi");
  redirect("/admina/messaggi");
}

export interface ReplyFormState {
  ok: boolean;
  error: string | null;
}

/**
 * Send a written reply to the requester via the project's from-address (Resend),
 * with the requester's email as Reply-To. Marks the message replied + handled.
 */
export async function replyToRequestAction(
  _prev: ReplyFormState,
  formData: FormData
): Promise<ReplyFormState> {
  await requireAdmin();

  const id = (formData.get("id") as string | null)?.trim();
  const bodyText = (formData.get("body") as string | null)?.trim() ?? "";

  if (!id) return { ok: false, error: "Messaggio non trovato." };
  if (bodyText.length < 2) {
    return { ok: false, error: "Scrivi un messaggio prima di inviare." };
  }

  const request = await prisma.request.findUnique({
    where: { id },
    include: { project: { select: { title: true, from_email: true } } },
  });
  if (!request) return { ok: false, error: "Messaggio non trovato." };

  const projectTitle = request.project
    ? t(request.project.title as Record<string, string>)
    : undefined;
  const fromEmail = request.project?.from_email || DEFAULT_FROM;
  // Rispondi al mittente reale (per le email inoltrate = reply_to_email).
  const toAddress = request.reply_to_email || request.email;
  // Se è una email con oggetto, rispondi in thread con "Re: <oggetto>".
  const subject =
    request.source === "email" && request.subject
      ? request.subject.toLowerCase().startsWith("re:")
        ? request.subject
        : `Re: ${request.subject}`
      : adminReplySubject(projectTitle);

  try {
    const mail = getMailAdapter();
    await mail.sendMail({
      to: toAddress,
      from: fromEmail,
      replyTo: fromEmail,
      subject,
      html: adminReplyHtml({
        requesterName: request.name,
        bodyText,
        projectTitle,
      }),
    });
  } catch (e) {
    console.error("[replyToRequestAction] invio fallito:", e);
    return {
      ok: false,
      error: "Invio non riuscito. Riprova tra qualche istante.",
    };
  }

  // Marca il messaggio originale come risposto+gestito.
  await prisma.request.update({
    where: { id },
    data: {
      replied_at: new Date(),
      status: "handled",
      handled_at: request.handled_at ?? new Date(),
    },
  });

  // Salva la risposta come messaggio OUTBOUND nello stesso thread, così la
  // conversazione è visibile in app (non solo inviata via email). Il thread è
  // quello dell'interlocutore (toAddress) + argomento normalizzato, coerente
  // con la thread_key calcolata in ricezione.
  await prisma.request.create({
    data: {
      name: "Tu",
      email: toAddress,
      reply_to_email: toAddress,
      subject,
      message: bodyText,
      project_id: request.project_id,
      source: request.source,
      direction: "outbound",
      thread_key: request.thread_key ?? threadKey(toAddress, request.subject),
      status: "handled",
      handled_at: new Date(),
    },
  });

  revalidatePath("/admina/messaggi");
  revalidatePath(`/admina/messaggi/${id}`);
  return { ok: true, error: null };
}
