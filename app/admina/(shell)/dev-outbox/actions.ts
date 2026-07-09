"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// Strumento SOLO di sviluppo: le azioni sono attive solo con MAIL_MODE=fake
// (come la pagina Dev Outbox) e richiedono admin.
function assertDevOutboxEnabled() {
  if (process.env.MAIL_MODE !== "fake") {
    throw new Error("Dev Outbox disponibile solo con MAIL_MODE=fake.");
  }
}

/** Elimina una singola email finta dalla Dev Outbox. */
export async function deleteDevOutboxAction(id: string) {
  assertDevOutboxEnabled();
  if (!(await requireAdmin())) throw new Error("Non autorizzato.");
  await prisma.devOutbox.delete({ where: { id } });
  revalidatePath("/admina/dev-outbox");
}

/** Svuota tutte le email finte dalla Dev Outbox. */
export async function clearDevOutboxAction() {
  assertDevOutboxEnabled();
  if (!(await requireAdmin())) throw new Error("Non autorizzato.");
  await prisma.devOutbox.deleteMany({});
  revalidatePath("/admina/dev-outbox");
}
