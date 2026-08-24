import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-premium">
        <div className="flex items-start gap-3">
          {danger && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </span>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="font-display text-base font-semibold text-ink">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-section disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brown-dark hover:bg-brown-dark/90"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
