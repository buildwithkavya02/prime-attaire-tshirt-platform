import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import StatusBadge from "../../components/admin/StatusBadge";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminSkeleton from "../../components/admin/AdminSkeleton";
import { deleteProduct, duplicateProduct, listProducts, setProductStatus } from "../../lib/api";
import type { AdminProduct, ProductListParams, ProductStatus } from "../../types/admin";

const STATUS_FILTERS: { label: string; value: ProductStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "inactive" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [sort, setSort] = useState<NonNullable<ProductListParams["sort"]>>("newest");
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProducts({ search: search || undefined, status, sort });
      setProducts(data);
    } catch {
      toast.error("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  useEffect(() => {
    const handle = setTimeout(load, 300); // debounce search/filter changes
    return () => clearTimeout(handle);
  }, [load]);

  const handleToggleStatus = async (p: AdminProduct) => {
    const next = p.status === "active" ? "inactive" : "active";
    try {
      const updated = await setProductStatus(p.id, next);
      if (updated) {
        setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)));
        toast.success(next === "active" ? "Product activated." : "Product deactivated.");
      }
    } catch {
      toast.error("Unable to update product status. Please try again.");
    }
  };

  const handleDuplicate = async (p: AdminProduct) => {
    try {
      await duplicateProduct(p.id);
      toast.success("Product duplicated.");
      load();
    } catch {
      toast.error("Unable to duplicate product. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      setProducts((list) => list.filter((x) => x.id !== pendingDelete.id));
      toast.success("Product deleted successfully.");
      setPendingDelete(null);
    } catch {
      toast.error("Unable to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Products"
      description="Manage your printable products and customization options."
      actions={
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-brown-dark px-4 py-2 text-sm font-semibold text-gold hover:bg-brown-dark/90"
        >
          <Plus size={15} /> Add Product
        </Link>
      }
    >
      {/* Search + filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-line p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  status === f.value ? "bg-brown-dark text-gold" : "text-muted hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-gold"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price Low–High</option>
            <option value="price-desc">Price High–Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <AdminSkeleton rows={4} />
      ) : products.length === 0 ? (
        <AdminEmptyState
          title="No Products Yet"
          description="You haven't added any products yet."
          actionLabel="+ Add Product"
          actionTo="/admin/products/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="card-premium overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center bg-section">
                <img
                  src={p.thumbnail || p.front}
                  alt={p.name}
                  className="h-full w-full object-contain p-6"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-ink">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      From &#8377;{p.basePrice} · {p.type.replace("-", " ")}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.colors.slice(0, 6).map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="h-4 w-4 rounded-full ring-1 ring-line"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <button
                    onClick={() => handleToggleStatus(p)}
                    className="text-xs font-semibold text-brown-dark hover:text-gold"
                  >
                    {p.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-brown-dark/40"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-brown-dark/40"
                      aria-label={`Duplicate ${p.name}`}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => setPendingDelete(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-red-600 hover:bg-red-50"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete Product?"
        description="This action cannot be undone. Are you sure you want to delete this product?"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AdminLayout>
  );
}
