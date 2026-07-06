"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { Prisma, ProjectStatus, ActionType } from "@prisma/client";
import { getStorageAdapter } from "@/lib/adapters";
import { parseGallery } from "@/lib/i18n";
import { sanitizeRichText } from "@/lib/sanitize-html";

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

/**
 * Best-effort deletion of stored image files by URL. Never throws — a failed
 * storage cleanup must not block the DB operation. Skips empty/duplicate URLs.
 */
async function deleteStoredImages(urls: (string | null | undefined)[]) {
  const storage = getStorageAdapter();
  const unique = Array.from(
    new Set(urls.filter((u): u is string => Boolean(u && u.trim())))
  );
  await Promise.all(
    unique.map((url) =>
      storage.delete(url).catch((e) => {
        console.error("[progetti] cleanup immagine fallita:", url, e);
      })
    )
  );
}

/** Collect cover + gallery URLs from a project record. */
function collectImageUrls(p: {
  cover_image_url: string | null;
  gallery: unknown;
}): string[] {
  return [p.cover_image_url, ...parseGallery(p.gallery).map((g) => g.url)].filter(
    (u): u is string => Boolean(u)
  );
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
  revalidatePath("/progetti");
}

export async function deleteProjectAction(id: string) {
  // Fetch image URLs before deleting the row, then clean them from storage.
  const project = await prisma.project.findUnique({
    where: { id },
    select: { cover_image_url: true, gallery: true },
  });
  await prisma.project.delete({ where: { id } });
  if (project) await deleteStoredImages(collectImageUrls(project));
  revalidatePath("/admina/progetti");
  revalidatePath("/progetti");
}

export async function moveProjectAction(id: string, dir: "up" | "down") {
  // Deterministic order even when sort_order values collide (e.g. all 0):
  // tie-break by created_at, then reindex to 0..n-1 so every swap has effect.
  const projects = await prisma.project.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    select: { id: true },
  });
  const idx = projects.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= projects.length) return;

  // Swap positions in the ordered array, then persist a clean 0..n-1 sequence.
  const reordered = [...projects];
  [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

  await prisma.$transaction(
    reordered.map((p, i) =>
      prisma.project.update({ where: { id: p.id }, data: { sort_order: i } })
    )
  );
  revalidatePath("/admina/progetti");
  revalidatePath("/progetti");
}

export async function saveProjectAction(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const id = formData.get("id") as string | null;
  const titleIt = (formData.get("title_it") as string | null)?.trim() ?? "";
  // Descriptions are rich text (HTML from the editor) — sanitize before saving.
  const shortDescIt = sanitizeRichText(formData.get("short_description_it"));
  const longDescIt = sanitizeRichText(formData.get("long_description_it"));
  const status = (formData.get("status") as ProjectStatus) ?? "available";
  const categoryId =
    (formData.get("category_id") as string | null) || null;
  const coverImageUrl =
    (formData.get("cover_image_url") as string | null)?.trim() || null;
  const galleryJson = (formData.get("gallery_json") as string | null) ?? "[]";
  const actionsJson =
    (formData.get("actions_json") as string | null) ?? "[]";
  const published = formData.get("published") === "on";
  const parsedSort = parseInt(
    (formData.get("sort_order") as string | null) ?? "0",
    10
  );
  const sortOrder = Number.isFinite(parsedSort) ? parsedSort : 0;
  // Email mittente: si inserisce solo il prefisso (es. "stickers"), il dominio
  // @deroarts.com è fisso. Sanifica il local-part; vuoto → null (usa il default).
  const emailLocal = (formData.get("from_email_local") as string | null)
    ?.trim()
    .toLowerCase()
    .replace(/@deroarts\.com$/i, "") // se l'utente incolla l'indirizzo intero
    .replace(/[^a-z0-9._-]/g, ""); // solo caratteri validi per un local-part
  const fromEmail = emailLocal ? `${emailLocal}@deroarts.com` : null;
  let slug =
    (formData.get("slug") as string | null)?.trim() || toSlug(titleIt);

  if (!titleIt) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Lo slug è obbligatorio." };

  let gallery: Array<Record<string, unknown>>;
  let actionsData: unknown[];
  try {
    const parsedGallery = JSON.parse(galleryJson);
    gallery = Array.isArray(parsedGallery) ? parsedGallery : [];
    const parsedActions = JSON.parse(actionsJson);
    actionsData = Array.isArray(parsedActions) ? parsedActions : [];
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
  let orphanedImages: string[] = [];
  if (id) {
    // For updates: check if slug changed; if so, ensure it's still unique.
    // Also capture the previous images to clean up any that were replaced.
    const current = await prisma.project.findUnique({
      where: { id },
      select: { slug: true, cover_image_url: true, gallery: true },
    });
    if (current && current.slug !== slug) {
      const conflict = await prisma.project.findUnique({ where: { slug } });
      if (conflict) slug = `${slug}-${Date.now()}`;
    }
    if (current) {
      const oldUrls = collectImageUrls(current);
      const newUrls = new Set(collectImageUrls(sharedData));
      // Images present before but not in the new set are now orphaned.
      orphanedImages = oldUrls.filter((u) => !newUrls.has(u));
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

  // Clean up images that were replaced/removed during this update.
  if (orphanedImages.length > 0) await deleteStoredImages(orphanedImages);

  revalidatePath("/admina/progetti");
  revalidatePath("/progetti");
  revalidatePath(`/progetti/${project.slug}`);
  redirect(`/admina/progetti`);
}
