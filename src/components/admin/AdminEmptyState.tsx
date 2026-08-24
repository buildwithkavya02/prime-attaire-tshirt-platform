import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function AdminEmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-section text-muted">
        <Inbox size={20} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 rounded-full bg-brown-dark px-5 py-2.5 text-sm font-semibold text-gold hover:bg-brown-dark/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
