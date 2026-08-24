export default function AdminSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-premium overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-section" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-section" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-section" />
            <div className="h-8 w-full animate-pulse rounded-full bg-section" />
          </div>
        </div>
      ))}
    </div>
  );
}
