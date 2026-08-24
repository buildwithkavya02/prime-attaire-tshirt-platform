import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { listProjects } from "../../lib/api";
import type { Project } from "../../types/admin";
import { getProduct } from "../../data/products";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter((p) =>
    `${p.projectName} ${p.customerName} ${p.token}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminLayout title="Projects">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <Link
          to="/admin/projects/new"
          className="flex items-center justify-center gap-2 rounded-full bg-brown-dark px-5 py-2.5 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01]"
        >
          <Plus size={15} /> Create Private Project
        </Link>
      </div>

      <div className="mt-6 card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-section/50 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Expiry</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    No projects found.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-section/30">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{p.projectName}</p>
                    <p className="text-xs text-muted">/design/{p.token}</p>
                  </td>
                  <td className="px-5 py-4 text-ink">{p.customerName}</td>
                  <td className="px-5 py-4 text-muted">{getProduct(p.productSlug).name}</td>
                  <td className="px-5 py-4 text-muted">
                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "No expiry"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                        p.revoked || p.status === "disabled"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-ok"
                      }`}
                    >
                      {p.revoked ? "Revoked" : p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brown-dark hover:text-gold"
                    >
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
