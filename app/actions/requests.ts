"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getMailAdapter } from "@/lib/adapters";
import { isRateLimited, looksLikeSpam } from "@/lib/security/spam";
import {
  ownerNotificationHtml,
  ownerNotificationSubject,
  autoReplyHtml,
  autoReplySubject,
} from "@/lib/mail/templates";

// ─── Validation schema ────────────────────────────────────────────────────────

const requestSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  email: z.string().email("Indirizzo email non valido"),
  message: z
    .string()
    .min(10, "Il messaggio deve contenere almeno 10 caratteri")
    .max(2000, "Il messaggio non può superare 2000 caratteri"),
  projectId: z.string().nullable().optional(),
});

// ─── State type ───────────────────────────────────────────────────────────────

export interface RequestFormState {
  ok: boolean;
  error: string | null;
  fieldErrors: Partial<Record<"name" | "email" | "message", string>>;
}

// Unica casella del sito: le richieste arrivano qui come email normali (letta
// dall'app Mail) e le risposte partono da qui. Il modulo serve solo per il
// primo contatto: il dialogo prosegue via email, fuori dal sito.
const INBOX = "info@deroarts.com";

const SEND_ERROR =
  "Invio non riuscito. Riprova tra qualche istante oppure scrivi a info@deroarts.com.";

// ─── Server action ────────────────────────────────────────────────────────────

export async function createRequestAction(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const raw = {
    name: (formData.get("name") as string | null) ?? "",
    email: (formData.get("email") as string | null) ?? "",
    message: (formData.get("message") as string | null) ?? "",
    projectId: (formData.get("projectId") as string | null) || null,
  };

  const result = requestSchema.safeParse(raw);
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    const fieldErrors: RequestFormState["fieldErrors"] = {};
    for (const [key, errors] of Object.entries(flat)) {
      const k = key as "name" | "email" | "message";
      if (errors && errors.length > 0) fieldErrors[k] = errors[0];
    }
    return { ok: false, error: null, fieldErrors };
  }

  const { name, email, message, projectId } = result.data;

  // Anti-spam: scartiamo prima di inviare qualsiasi email. Al mittente
  // rispondiamo come se fosse andata bene — un bot non deve capire di essere
  // stato riconosciuto, e un utente vero non finisce qui (vedi lib/security/spam).
  if (isRateLimited() || looksLikeSpam({ name, email, message })) {
    return { ok: true, error: null, fieldErrors: {} };
  }

  // Titolo del progetto (solo per l'oggetto della email). Se il DB non
  // risponde, la richiesta parte comunque come contatto generico.
  let projectTitle: string | undefined;
  if (projectId) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { title: true },
      });
      projectTitle = (project?.title as Record<string, string> | undefined)?.it || undefined;
    } catch (e) {
      console.error("[createRequestAction] Project lookup error:", e);
    }
  }

  const mail = getMailAdapter();

  // La richiesta NON viene salvata nel DB: questa email è l'unica copia.
  // Se l'invio fallisce lo diciamo al visitatore, così il messaggio non si perde.
  try {
    await mail.sendMail({
      to: INBOX,
      from: INBOX,
      replyTo: email, // "Rispondi" dall'app Mail scrive direttamente al cliente
      subject: ownerNotificationSubject(projectTitle),
      html: ownerNotificationHtml({
        projectTitle,
        requesterName: name,
        requesterEmail: email,
        message,
      }),
    });
  } catch (e) {
    console.error("[createRequestAction] Mail error:", e);
    return { ok: false, error: SEND_ERROR, fieldErrors: {} };
  }

  // Conferma automatica al cliente: utile ma non essenziale, un errore qui
  // non annulla l'invio già riuscito.
  try {
    await mail.sendMail({
      to: email,
      from: INBOX,
      subject: autoReplySubject(projectTitle),
      html: autoReplyHtml({ projectTitle, requesterName: name }),
    });
  } catch (e) {
    console.error("[createRequestAction] Auto-reply error:", e);
  }

  return { ok: true, error: null, fieldErrors: {} };
}
