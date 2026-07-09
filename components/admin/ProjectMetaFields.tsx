const PROJECT_STATUSES = [
  { value: "available", label: "Disponibile" },
  { value: "coming_soon", label: "Prossimamente" },
  { value: "demo_available", label: "Demo disponibile" },
];

interface Category {
  id: string;
  name: string;
}

interface Props {
  status: string;
  categoryId: string;
  sortOrder: number;
  fromEmailLocal: string;
  published: boolean;
  categories: Category[];
}

/** Sezione "Stato e categoria": select/campi non controllati (submit via name). */
export default function ProjectMetaFields({
  status,
  categoryId,
  sortOrder,
  fromEmailLocal,
  published,
  categories,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-graphite">Stato e categoria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">Stato</label>
          <select
            name="status"
            defaultValue={status}
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
            defaultValue={categoryId}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end bg-white"
          >
            <option value="">— Nessuna —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">Ordine</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={sortOrder}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite mb-1.5">Email mittente</label>
          <div className="flex items-stretch">
            <input
              type="text"
              name="from_email_local"
              defaultValue={fromEmailLocal}
              placeholder="es. stickers"
              className="w-full min-w-0 px-3 py-2.5 border border-gray-200 rounded-l-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-end focus:z-10"
            />
            <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 text-sm text-gray-500 whitespace-nowrap">
              @deroarts.com
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Scrivi solo il nome prima della chiocciola (es. <span className="font-mono">stickers</span>). Lascia vuoto per l&apos;indirizzo predefinito.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="published"
          defaultChecked={published}
          className="w-4 h-4 rounded border-gray-300 text-green-end focus:ring-green-end"
        />
        <span className="text-sm font-medium text-graphite">Pubblicato (visibile sul sito)</span>
      </label>
    </section>
  );
}
