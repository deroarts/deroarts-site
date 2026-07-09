"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import ProjectFormHeader from "./ProjectFormHeader";
import { saveProjectAction } from "@/app/admina/(shell)/progetti/actions";
import { ACTION_LABELS } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import ImageFrameEditor from "./ImageFrameEditor";
import GalleryEditor, { type GalleryItem } from "./GalleryEditor";
import ProjectCoreFields from "./ProjectCoreFields";
import ProjectActionsEditor, { type ActionItem } from "./ProjectActionsEditor";
import ProjectMetaFields from "./ProjectMetaFields";

interface Category {
  id: string;
  name: unknown;
}

interface ProjectFormProps {
  project?: {
    id: string;
    slug: string;
    title: unknown;
    short_description: unknown;
    long_description: unknown;
    status: string;
    category_id: string | null;
    cover_image_url: string | null;
    gallery: unknown;
    published: boolean;
    sort_order: number;
    from_email: string | null;
    actions: Array<{
      id: string;
      type: string;
      label: unknown;
      url: string | null;
      enabled: boolean;
      sort_order: number;
    }>;
  };
  categories: Category[];
  /** Testo del titolo mostrato nell'header del form (es. "Modifica Stickers"). */
  heading: string;
  /** URL di anteprima pubblica del progetto (in modifica). */
  previewUrl?: string;
  /** True se il progetto non è ancora pubblicato (mostra il badge "1h" sull'anteprima). */
  previewIsSigned?: boolean;
}

function getIt(field: unknown): string {
  if (!field || typeof field !== "object" || Array.isArray(field)) return "";
  return (field as Record<string, string>).it ?? "";
}

export default function ProjectForm({
  project,
  categories,
  heading,
  previewUrl,
  previewIsSigned,
}: ProjectFormProps) {
  const isEdit = !!project;

  const [title, setTitle] = useState(isEdit ? getIt(project!.title) : "");
  const [slug, setSlug] = useState(isEdit ? project!.slug : "");
  const [slugManual, setSlugManual] = useState(isEdit);

  const [coverImageUrl, setCoverImageUrl] = useState(
    isEdit ? (project!.cover_image_url ?? "") : ""
  );

  const [gallery, setGallery] = useState<GalleryItem[]>(
    isEdit
      ? ((project!.gallery as GalleryItem[]) ?? []).map((g) => ({
          url: g.url,
          alt_it: getIt((g as GalleryItem & { alt: unknown }).alt) || (g as GalleryItem).alt_it || "",
        }))
      : []
  );

  const [actions, setActions] = useState<ActionItem[]>(
    isEdit
      ? project!.actions.map((a) => ({
          type: a.type,
          label_it: getIt(a.label),
          url: a.url ?? "",
          enabled: a.enabled,
          sort_order: a.sort_order,
        }))
      : []
  );

  // Rich-text descriptions (HTML) — mirrored into hidden inputs for the form.
  const [shortDesc, setShortDesc] = useState<string>(
    isEdit ? getIt(project!.short_description) : ""
  );
  const [longDesc, setLongDesc] = useState<string>(
    isEdit ? getIt(project!.long_description) : ""
  );

  const [state, formAction] = useFormState(saveProjectAction, { error: null });
  const [isPending, startTransition] = useTransition();

  // Il submit è racchiuso in una transition così l'header (fuori dal form)
  // può mostrare lo stato "Salvataggio…" tramite isPending.
  function handleSubmit(formData: FormData) {
    startTransition(() => formAction(formData));
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugManual) {
      setSlug(slugify(v));
    }
  }

  function addAction() {
    setActions((a) => [
      ...a,
      { type: "demo", label_it: "Prova la demo", url: "", enabled: true, sort_order: a.length },
    ]);
  }

  function updateAction(i: number, key: keyof ActionItem, val: string | boolean | number) {
    setActions((a) =>
      a.map((item, idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [key]: val };
        // Auto-fill Italian label when type changes
        if (key === "type") {
          updated.label_it = ACTION_LABELS[val as string] ?? "";
        }
        return updated;
      })
    );
  }

  function removeAction(i: number) {
    setActions((a) => a.filter((_, idx) => idx !== i));
  }

  function moveAction(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= actions.length) return;
    setActions((a) => {
      const arr = [...a];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr.map((item, idx) => ({ ...item, sort_order: idx }));
    });
  }

  const galleryJson = JSON.stringify(
    gallery.map((g) => ({ url: g.url, alt: { it: g.alt_it, en: "" } }))
  );

  const actionsJson = JSON.stringify(
    actions.map((a, i) => ({ ...a, sort_order: i }))
  );

  return (
    <>
      <ProjectFormHeader
        heading={heading}
        submitLabel={isEdit ? "Salva" : "Crea progetto"}
        formId="project-form"
        pending={isPending}
        previewUrl={previewUrl}
        previewIsSigned={previewIsSigned}
      />

      <form id="project-form" action={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Hidden fields */}
        {isEdit && <input type="hidden" name="id" value={project!.id} />}
        <input type="hidden" name="cover_image_url" value={coverImageUrl} />
        <input type="hidden" name="gallery_json" value={galleryJson} />
        <input type="hidden" name="actions_json" value={actionsJson} />

        {state.error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
          {state.error}
        </div>
      )}

      {/* ── Core info ──────────────────────────────────────────────────── */}
      <ProjectCoreFields
        title={title}
        onTitleChange={handleTitleChange}
        slug={slug}
        onSlugChange={(v) => {
          setSlug(v);
          setSlugManual(true);
        }}
        shortDesc={shortDesc}
        onShortDescChange={setShortDesc}
        longDesc={longDesc}
        onLongDescChange={setLongDesc}
      />

      {/* ── Status & category ────────────────────────────────────────────── */}
      <ProjectMetaFields
        status={isEdit ? project!.status : "available"}
        categoryId={isEdit ? (project!.category_id ?? "") : ""}
        sortOrder={isEdit ? project!.sort_order : 0}
        fromEmailLocal={
          isEdit ? (project!.from_email ?? "").replace(/@deroarts\.com$/i, "") : ""
        }
        published={isEdit ? project!.published : false}
        categories={categories.map((c) => ({ id: c.id, name: getIt(c.name) }))}
      />

      {/* ── Images ───────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h2 className="font-semibold text-graphite">Immagini</h2>

        {/* Cover image — 16:10 */}
        <div>
          <p className="text-sm font-medium text-graphite mb-2">
            Immagine di copertina{" "}
            <span className="text-xs font-normal text-gray-400">(16:10)</span>
          </p>
          <ImageFrameEditor
            ratio="cover"
            currentUrl={coverImageUrl || null}
            onChange={(url) => {
              setCoverImageUrl(url);
            }}
          />
        </div>

        {/* Gallery — 4:3 each */}
        <div>
          <p className="text-sm font-medium text-graphite mb-3">
            Galleria{" "}
            <span className="text-xs font-normal text-gray-400">(4:3)</span>
          </p>
          <GalleryEditor items={gallery} onChange={setGallery} />
        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <ProjectActionsEditor
        actions={actions}
        onAdd={addAction}
        onUpdate={updateAction}
        onRemove={removeAction}
        onMove={moveAction}
      />
      </form>
    </>
  );
}
