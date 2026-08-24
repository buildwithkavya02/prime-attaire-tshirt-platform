import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { listDesigns } from "../../lib/api";
import type { Design, Project } from "../../types/admin";
import { getProduct } from "../../data/products";

const statusColors: Record<string, string> = {
  DRAFT: "bg-line text-muted",
  SUBMITTED: "bg-gold/20 text-brown-dark",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-ok",
  REJECTED: "bg-red-100 text-red-600",
};

export default function AdminDesigns() {
  const [designs, setDesigns] = useState<(Design & { project?: Project })[]>([]);

  useEffect(() => {
    listDesigns().then((all) => setDesigns(all.filter((d) => d.status !== "DRAFT")));
  }, []);

  return (
    <AdminLayout title="Designs">
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-section/50 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {designs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    No design submissions yet.
                  </td>
                </tr>
              )}
              {designs.map((d) => (
                <tr key={d.id} className="hover:bg-section/30">
                  <td className="px-5 py-4 text-ink">{d.project?.customerName ?? "—"}</td>
                  <td className="px-5 py-4 text-ink">{d.project?.projectName ?? "Unknown project"}</td>
                  <td className="px-5 py-4 text-muted">
                    {d.project ? getProduct(d.project.productSlug).name : "—"}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {d.submittedAt ? new Date(d.submittedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[d.status]}`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/designs/${d.id}`}
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
