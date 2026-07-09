"use client";

export interface ActionItem {
  type: string;
  label_it: string;
  url: string;
  enabled: boolean;
  sort_order: number;
}

const ACTION_TYPES = [
  { value: "demo", label: "Demo" },
  { value: "request_info", label: "Richiedi informazioni" },
  { value: "download", label: "Download" },
  { value: "app_store", label: "App Store" },
  { value: "play_store", label: "Google Play" },
  { value: "external", label: "Link esterno" },
];

interface Props {
  actions: ActionItem[];
  onAdd: () => void;
  onUpdate: (i: number, key: keyof ActionItem, val: string | boolean | number) => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
}

/** Editor dei pulsanti-azione di un progetto (demo, download, store…). */
export default function ProjectActionsEditor({
  actions,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-graphite">Pulsanti azione</h2>
        <button
          type="button"
          onClick={onAdd}
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
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => onMove(i, -1)}
                  disabled={i === 0}
                  className="text-gray-300 hover:text-graphite disabled:opacity-20 leading-none"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onMove(i, 1)}
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
                onChange={(e) => onUpdate(i, "type", e.target.value)}
                className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end bg-white"
              >
                {ACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={action.label_it}
                onChange={(e) => onUpdate(i, "label_it", e.target.value)}
                placeholder="Etichetta italiana"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end"
              />
              <label className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={action.enabled}
                  onChange={(e) => onUpdate(i, "enabled", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Attivo
              </label>
              <button
                type="button"
                onClick={() => onRemove(i)}
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
                onChange={(e) => onUpdate(i, "url", e.target.value)}
                placeholder="URL (es. https://demo.deroarts.com/…)"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-end"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
