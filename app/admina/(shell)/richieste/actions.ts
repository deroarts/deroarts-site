"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { RequestStatus } from "@prisma/client";

export async function updateRequestStatusAction(
  id: string,
  status: RequestStatus
) {
  await prisma.request.update({
    where: { id },
    data: {
      status,
      handled_at: status === "handled" ? new Date() : undefined,
    },
  });
  revalidatePath("/admina/richieste");
  revalidatePath(`/admina/richieste/${id}`);
}
