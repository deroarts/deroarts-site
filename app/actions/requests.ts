"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getMailAdapter } from "@/lib/adapters";
import { sendPushToAll } from "@/lib/push/send";
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

const DEFAULT_FROM = "info@deroarts.com";

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

  // Resolve project context
  let project: { title: unknown; from_email: string | null } | null = null;
  if (projectId) {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, from_email: true },
    });
  }

  const projectTitle = project
    ? ((project.title as Record<string, string>)?.it ?? "")
    : undefined;
  const fromEmail = project?.from_email || DEFAULT_FROM;
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_FROM;

  // Persist request
  try {
    await prisma.request.create({
      data: { name, email, message, project_id: projectId ?? null },
    });
  } catch {
    return {
      ok: false,
      error: "Errore durante il salvataggio. Riprova tra qualche istante.",
      fieldErrors: {},
    };
  }

  // Send emails (fire-and-forget — don't fail user on mail issues)
  try {
    const mail = getMailAdapter();
    await Promise.all([
      mail.sendMail({
        to: adminEmail,
        from: fromEmail,
        replyTo: email,
        subject: ownerNotificationSubject(projectTitle),
        html: ownerNotificationHtml({
          projectTitle,
          requesterName: name,
          requesterEmail: email,
          message,
        }),
      }),
      mail.sendMail({
        to: email,
        from: fromEmail,
        subject: autoReplySubject(projectTitle),
        html: autoReplyHtml({ projectTitle, requesterName: name }),
      }),
    ]);
  } catch (e) {
    console.error("[createRequestAction] Mail error:", e);
    // Don't surface mail errors to the user
  }

  // Push notification to admin devices (also fire-and-forget & self-guarding).
  await sendPushToAll({
    title: projectTitle
      ? `Nuovo messaggio — ${projectTitle}`
      : "Nuovo messaggio dal sito",
    body: `${name}: ${message.slice(0, 90)}${message.length > 90 ? "…" : ""}`,
    url: "/admina/messaggi",
    tag: "deroarts-messaggio",
  });

  return { ok: true, error: null, fieldErrors: {} };
}
