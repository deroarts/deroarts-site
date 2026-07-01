"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâã]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return;

  let slug = toSlug(name);
  // Ensure slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const maxOrder = await prisma.category.aggregate({ _max: { sort_order: true } });
  await prisma.category.create({
    data: {
      name: { it: name, en: "" },
      slug,
      sort_order: (maxOrder._max.sort_order ?? -1) + 1,
    },
  });

  revalidatePath("/admina/categorie");
}

export async function renameCategoryAction(
  id: string,
  formData: FormData
) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return;

  await prisma.category.update({
    where: { id },
    data: { name: { it: name, en: "" } },
  });

  revalidatePath("/admina/categorie");
  revalidatePath("/admina/progetti");
}

export async function moveCategoryAction(id: string, dir: "up" | "down") {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: "asc" },
    select: { id: true, sort_order: true },
  });
  const idx = categories.findIndex((c) => c.id === id);
  if (idx < 0) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= categories.length) return;

  const current = categories[idx];
  const swap = categories[swapIdx];

  await prisma.$transaction([
    prisma.category.update({ where: { id: current.id }, data: { sort_order: swap.sort_order } }),
    prisma.category.update({ where: { id: swap.id }, data: { sort_order: current.sort_order } }),
  ]);
  revalidatePath("/admina/categorie");
}

export async function deleteCategoryAction(id: string) {
  const count = await prisma.project.count({ where: { category_id: id } });
  if (count > 0) {
    throw new Error(
      `Impossibile eliminare: ${count} progetto/i usa questa categoria.`
    );
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admina/categorie");
}
