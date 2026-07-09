"use client";

import RichTextEditor from "./RichTextEditor";

interface Props {
  title: string;
  onTitleChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  shortDesc: string;
  onShortDescChange: (v: string) => void;
  longDesc: string;
  onLongDescChange: (v: string) => void;
}

/** Sezione "Informazioni principali": titolo, slug, descrizioni. */
export default function ProjectCoreFields({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  shortDesc,
  onShortDescChange,
  longDesc,
  onLongDescChange,
}: Props) {
  return (
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
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onSlugChange(e.target.value)}
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
        <RichTextEditor
          value={shortDesc}
          onChange={onShortDescChange}
          minHeightClass="min-h-[3.5rem]"
          placeholder="Una riga che descrive il progetto"
        />
        <input type="hidden" name="short_description_it" value={shortDesc} />
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-1.5">
          Descrizione lunga (italiano)
        </label>
        <RichTextEditor
          value={longDesc}
          onChange={onLongDescChange}
          minHeightClass="min-h-[9rem]"
          placeholder="Descrizione completa, funzionalità, benefici…"
        />
        <input type="hidden" name="long_description_it" value={longDesc} />
      </div>
    </section>
  );
}
