import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { createProject, getProject, listProducts, updateProject } from "../../lib/api";
import type { AdminProduct, CreateProjectInput } from "../../types/admin";

const emptyForm: CreateProjectInput = {
  customerName: "",
  customerPhone: "",
  projectName: "",
  productSlug: "",
  allowedColors: [],
  expiryDate: null,
  accessCodeRequired: true,
  notes: "",
};

export default function AdminProjectForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<CreateProjectInput>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listProducts().then((list) => {
      setProducts(list.filter((p) => p.active));
      setForm((f) => (f.productSlug ? f : { ...f, productSlug: list.find((p) => p.active)?.slug ?? "" }));
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    getProject(id).then((p) => {
      if (!p) {
        toast.error("Project not found.");
        navigate("/admin/projects");
        return;
      }
      setForm({
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        projectName: p.projectName,
        productSlug: p.productSlug,
        allowedColors: p.allowedColors,
        expiryDate: p.expiryDate,
        accessCodeRequired: p.accessCodeRequired,
        notes: p.notes,
      });
      setLoading(false);
    });
  }, [id, navigate]);

  const selectedProduct = products.find((p) => p.slug === form.productSlug);

  const toggleColor = (hex: string) => {
    setForm((f) => ({
      ...f,
      allowedColors: f.allowedColors.includes(hex)
        ? f.allowedColors.filter((c) => c !== hex)
        : [...f.allowedColors, hex],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.projectName || !form.productSlug) {
      toast.error("Please fill in customer name, project name and product.");
      return;
    }
    if (form.allowedColors.length === 0) {
      toast.error("Select at least one allowed color.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateProject(id, form);
        toast.success("Project updated.");
        navigate(`/admin/projects/${id}`);
      } else {
        const project = await createProject(form);
        toast.success("Private project created.");
        navigate(`/admin/projects/${project.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Edit Project" : "Create Private Project"}>
        <p className="text-sm text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Project" : "Create Private Project"}>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card-premium space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Customer Name
              </label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="input-lux mt-2"
                placeholder="ABC Company"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Customer Phone
              </label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                className="input-lux mt-2"
                placeholder="9999999999"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Project Name
            </label>
            <input
              value={form.projectName}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              className="input-lux mt-2"
              placeholder="ABC Company Annual Day T-Shirts"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Product
            </label>
            <select
              value={form.productSlug}
              onChange={(e) =>
                setForm((f) => ({ ...f, productSlug: e.target.value, allowedColors: [] }))
              }
              className="input-lux mt-2 appearance-none"
            >
              <option value="" disabled>
                Select a product
              </option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Allowed Colors
              </label>
              <div className="mt-2 flex flex-wrap gap-3">
                {selectedProduct.colors.map((hex) => {
                  const active = form.allowedColors.includes(hex);
                  return (
                    <button
                      type="button"
                      key={hex}
                      onClick={() => toggleColor(hex)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        active ? "ring-2 ring-gold ring-offset-2" : "ring-1 ring-line"
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {active && <Check size={13} className="text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
                className="input-lux mt-2"
              />
              <p className="mt-1 text-[11px] text-muted">Leave blank to use the default expiry.</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Access Code Required
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl2 border border-line bg-bg px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={form.accessCodeRequired}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accessCodeRequired: e.target.checked }))
                  }
                  className="h-4 w-4 accent-gold"
                />
                <span className="text-sm text-ink">
                  Customer must enter an access code to open the link
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="input-lux mt-2 resize-none"
              placeholder="Internal notes about this project (not shown to the customer)"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brown-dark px-7 py-3 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
          >
            {isEdit ? "Save Changes" : "Create Private Project"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-line px-7 py-3 text-sm font-semibold text-ink hover:border-brown-dark/40"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
