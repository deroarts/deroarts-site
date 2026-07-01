import { STATUS_LABELS } from "@/lib/i18n";

const STATUS_STYLES: Record<string, string> = {
  available:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  coming_soon:
    "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  demo_available:
    "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${textSize} ${style}`}
    >
      {label}
    </span>
  );
}
