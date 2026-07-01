"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { Prisma, ProjectStatus, ActionType } from "@prisma/client";

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

export interface ProjectFormState {
  error: string | null;
}

export async function togglePublishedAction(id: string, published: boolean) {
  await prisma.project.update({
    where: { id },
    data: { published: !published },
  });
  revalidatePath("/admina/progetti");
}

export async function deleteProjectAction(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admina/progetti");
}

export async function moveProjectAction(id: string, dir: "up" | "down") {
  const projects = await prisma.project.findMany({
    orderBy: { sort_order: "asc" },
    select: { id: true, sort_order: true },
  });
  const idx = projects.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= projects.length) return;

  const current = projects[idx];
  const swap = projects[swapIdx];

  await prisma.$transaction([
    prisma.project.update({ where: { id: current.id }, data: { sort_order: swap.sort_order } }),
    prisma.project.update({ where: { id: swap.id }, data: { sort_order: current.sort_order } }),
  ]);
  revalidatePath("/admina/progetti");
}

export async function saveProjectAction(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const id = formData.get("id") as string | null;
  const titleIt = (formData.get("title_it") as string | null)?.trim() ?? "";
  const shortDescIt =
    (formData.get("short_description_it") as string | null)?.trim() ?? "";
  const longDescIt =
    (formData.get("long_description_it") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as ProjectStatus) ?? "available";
  const categoryId =
    (formData.get("category_id") as string | null) || null;
  const coverImageUrl =
    (formData.get("cover_image_url") as string | null)?.trim() || null;
  const galleryJson = (formData.get("gallery_json") as string | null) ?? "[]";
  const actionsJson =
    (formData.get("actions_json") as string | null) ?? "[]";
  const published = formData.get("published") === "on";
  const sortOrder = parseInt(
    (formData.get("sort_order") as string | null) ?? "0"
  );
  const fromEmail =
    (formData.get("from_email") as string | null)?.trim() || null;
  let slug =
    (formData.get("slug") as string | null)?.trim() || toSlug(titleIt);

  if (!titleIt) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Lo slug è obbligatorio." };

  let gallery: Array<Record<string, unknown>>;
  let actionsData: unknown[];
  try {
    const parsedGallery = JSON.parse(galleryJson);
    gallery = Array.isArray(parsedGallery) ? parsedGallery : [];
    actionsData = JSON.parse(actionsJson);
  } catch {
    return { error: "Dati galleria o azioni non validi." };
  }

  const sharedData = {
    title: { it: titleIt, en: "" },
    short_description: { it: shortDescIt, en: "" },
    long_description: { it: longDescIt, en: "" },
    status,
    category_id: categoryId,
    cover_image_url: coverImageUrl,
    gallery: gallery as Prisma.InputJsonValue,
    published,
    sort_order: sortOrder,
    from_email: fromEmail,
  };

  let project;
  if (id) {
    // For updates: check if slug changed; if so, ensure it's still unique
    const current = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
    if (current && current.slug !== slug) {
      const conflict = await prisma.project.findUnique({ where: { slug } });
      if (conflict) slug = `${slug}-${Date.now()}`;
    }
    project = await prisma.project.update({
      where: { id },
      data: { ...sharedData, slug },
    });
  } else {
    // For creates: ensure slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    project = await prisma.project.create({
      data: { ...sharedData, slug },
    });
  }

  // Replace all actions
  await prisma.projectAction.deleteMany({ where: { project_id: project.id } });
  const actionsArr = actionsData as Array<{
    type: ActionType;
    label_it: string;
    url?: string | null;
    enabled: boolean;
    sort_order: number;
  }>;
  if (actionsArr.length > 0) {
    await prisma.projectAction.createMany({
      data: actionsArr.map((a, i) => ({
        project_id: project.id,
        type: a.type,
        label: { it: a.label_it || "", en: "" },
        url: a.url?.trim() || null,
        enabled: a.enabled,
        sort_order: a.sort_order ?? i,
      })),
    });
  }

  revalidatePath("/admina/progetti");
  revalidatePath(`/progetti/${project.slug}`);
  redirect(`/admina/progetti`);
}
