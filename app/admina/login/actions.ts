"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = (formData.get("email") as string | null) ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const remember = formData.get("remember") === "on";

  const ok = await login(email, password, remember);
  if (!ok) {
    return { error: "Email o password non corretti." };
  }

  redirect("/admina/progetti");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admina/login");
}
