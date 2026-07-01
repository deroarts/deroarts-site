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
  revalidatePath("/admin/progetti");
}

export async function deleteProjectAction(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/progetti");
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

  // Ensure slug uniqueness when creating
  if (!id) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
  }

  const projectData = {
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
    project = await prisma.project.update({
      where: { id },
      data: projectData,
    });
  } else {
    project = await prisma.project.create({
      data: { ...projectData, slug },
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

  revalidatePath("/admin/progetti");
  revalidatePath(`/progetti/${project.slug}`);
  redirect(`/admin/progetti`);
}
