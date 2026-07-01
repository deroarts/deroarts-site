"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { saveProjectAction } from "@/app/admina/(shell)/progetti/actions";
import { ACTION_LABELS } from "@/lib/i18n";
import ImageFrameEditor from "./ImageFrameEditor";
import GalleryEditor, { type GalleryItem } from "./GalleryEditor";

const PROJECT_STATUSES = [
  { value: "available", label: "Disponibile" },
  { value: "coming_soon", label: "Prossimamente" },
  { value: "demo_available", label: "Demo disponibile" },
];

const ACTION_TYPES = [
  { value: "demo", label: "Demo" },
  { value: "request_info", label: "Richiedi informazioni" },
  { value: "download", label: "Download" },
  { value: "app_store", label: "App Store" },
  { value: "play_store", label: "Google Play" },
  { value: "external", label: "Link esterno" },
];

interface ActionItem {
  type: string;
  label_it: string;
  url: string;
  enabled: boolean;
  sort_order: number;
}

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
}

function getIt(field: unknown): string {
  if (!field || typeof field !== "object" || Array.isArray(field)) return "";
  return (field as Record<string, string>).it ?? "";
}

function slugify(text: string): string {
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 rounded-xl bg-green-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {pending ? "Salvataggio…" : label}
    </button>
  );
}

export default function ProjectForm({ project, categories }: ProjectFormProps) {
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

  const [state, formAction] = useFormState(saveProjectAction, { error: null });

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
    <form action={formAction} className="space-y-8 max-w-3xl">
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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-graphite">Informazioni principali</h2>

        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">
            Titolo (italiano) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title_it"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent"
            placeholder="Nome del progetto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">
            Slug (URL) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent"
            placeholder="nome-del-progetto"
          />
          <p className="text-xs text-gray-400 mt-1">
            URL pubblico: /progetti/<span className="font-mono">{slug || "…"}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">
            Descrizione breve (italiano)
          </label>
          <textarea
            name="short_description_it"
            rows={2}
            defaultValue={isEdit ? getIt(project!.short_description) : ""}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent resize-none"
            placeholder="Una riga che descrive il progetto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">
            Descrizione lunga (italiano)
          </label>
          <textarea
            name="long_description_it"
            rows={6}
            defaultValue={isEdit ? getIt(project!.long_description) : ""}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:border-transparent resize-y"
            placeholder="Descrizione completa, funzionalità, a chi è rivolto…"
          />
        </div>
      </section>

      {/* ── Status & category ────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-graphite">Stato e categoria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">Stato</label>
            <select
              name="status"
              defaultValue={isEdit ? project!.status : "available"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end bg-white"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">Categoria</label>
            <select
              name="category_id"
              defaultValue={isEdit ? (project!.category_id ?? "") : ""}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end bg-white"
            >
              <option value="">— Nessuna —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getIt(c.name)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">Ordine</label>
            <input
              type="number"
              name="sort_order"
              defaultValue={isEdit ? project!.sort_order : 0}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">Email mittente</label>
            <input
              type="email"
              name="from_email"
              defaultValue={isEdit ? (project!.from_email ?? "") : ""}
              placeholder="info@deroarts.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={isEdit ? project!.published : false}
            className="w-4 h-4 rounded border-gray-300 text-green-end focus:ring-green-end"
          />
          <span className="text-sm font-medium text-graphite">Pubblicato (visibile sul sito)</span>
        </label>
      </section>

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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-graphite">Pulsanti azione</h2>
          <button
            type="button"
            onClick={addAction}
            className="text-xs text-green-end hover:underline font-medium"
          >
            + Aggiungi azione
          </button>
        </div>
        {actions.length === 0 && (
          <p className="text-xs text-gray-400">Nessuna azione definita.</p>
        )}
        <div className="space-y-3">
          {actions.map((action, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveAction(i, -1)}
                    disabled={i === 0}
                    className="text-gray-300 hover:text-graphite disabled:opacity-20 leading-none"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAction(i, 1)}
                    disabled={i === actions.length - 1}
                    className="text-gray-300 hover:text-graphite disabled:opacity-20 leading-none"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <select
                  value={action.type}
                  onChange={(e) => updateAction(i, "type", e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end bg-white"
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={action.label_it}
                  onChange={(e) => updateAction(i, "label_it", e.target.value)}
                  placeholder="Etichetta italiana"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end"
                />
                <label className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={action.enabled}
                    onChange={(e) => updateAction(i, "enabled", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Attivo
                </label>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {action.type !== "request_info" && (
                <input
                  type="url"
                  value={action.url}
                  onChange={(e) => updateAction(i, "url", e.target.value)}
                  placeholder="URL (es. https://demo.deroarts.com/…)"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <SubmitButton label={isEdit ? "Salva modifiche" : "Crea progetto"} />
          {isEdit && (
            <Link
              href={`/progetti/${project!.slug}`}
              target="_blank"
              className="text-sm text-gray-500 hover:text-green-end transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Anteprima
            </Link>
          )}
        </div>
        <Link
          href="/admina/progetti"
          className="text-sm text-gray-400 hover:text-graphite transition-colors"
        >
          Annulla
        </Link>
      </div>
    </form>
  );
}
