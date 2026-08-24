import type { ProductStatus } from "../../types/admin";

const STYLES: Record<ProductStatus, string> = {
  active: "bg-green-100 text-ok",
  draft: "bg-amber-100 text-amber-700",
  inactive: "bg-line text-muted",
};

const LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
};

export default function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
