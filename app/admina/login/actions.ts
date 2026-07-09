"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const nickname = (formData.get("nickname") as string | null) ?? "";
  const pin = (formData.get("pin") as string | null) ?? "";

  const ok = await login(nickname, pin);
  if (!ok) {
    return { error: "Nickname o PIN non corretti." };
  }

  redirect("/admina/progetti");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admina/login");
}
