import { STATUS_LABELS } from "@/lib/tracking";

const STYLES = {
  received: "bg-amber-100 text-amber-900",
  preparing: "bg-amber-100 text-amber-900",
  on_the_way: "bg-blue-100 text-blue-900",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-stone-200 text-stone-600",
};

// An icon as well as colour, so the status never depends on colour alone.
const ICONS = { on_the_way: "→", delivered: "✓", cancelled: "✕" };

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[status] ?? STYLES.received
      }`}
    >
      {ICONS[status] && <span aria-hidden="true">{ICONS[status]}</span>}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}