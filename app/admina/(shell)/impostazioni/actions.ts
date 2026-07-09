"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_CRED_KEY } from "@/lib/auth/cookie-adapter";

const PIN_RE = /^\d{6}$/;

/**
 * Cambia il PIN admin. Richiede il PIN attuale corretto e un nuovo PIN di 6
 * cifre. Il PIN è salvato SOLO come hash bcrypt. Nessun valore in chiaro nei
 * log o nei ritorni.
 */
export async function changePinAction(
  _prev: { ok: boolean; error: string | null },
  formData: FormData
): Promise<{ ok: boolean; error: string | null }> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Non autorizzato." };
  }

  const currentPin = ((formData.get("currentPin") as string | null) ?? "").trim();
  const newPin = ((formData.get("newPin") as string | null) ?? "").trim();
  const confirmPin = ((formData.get("confirmPin") as string | null) ?? "").trim();

  if (!PIN_RE.test(newPin)) {
    return { ok: false, error: "Il nuovo PIN deve avere esattamente 6 cifre." };
  }
  if (newPin !== confirmPin) {
    return { ok: false, error: "Il nuovo PIN e la conferma non coincidono." };
  }

  const cred = await prisma.adminCredential.findUnique({
    where: { key: ADMIN_CRED_KEY },
    select: { pin_hash: true },
  });
  if (!cred) {
    return { ok: false, error: "Credenziali non trovate." };
  }

  const currentOk = await bcrypt.compare(currentPin, cred.pin_hash);
  if (!currentOk) {
    return { ok: false, error: "Il PIN attuale non è corretto." };
  }

  const pin_hash = await bcrypt.hash(newPin, 10);
  await prisma.adminCredential.update({
    where: { key: ADMIN_CRED_KEY },
    data: { pin_hash },
  });

  return { ok: true, error: null };
}
