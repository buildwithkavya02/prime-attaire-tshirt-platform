import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/admin/AdminLayout";
import { listProjects } from "../../lib/api";
import type { Project } from "../../types/admin";

export default function AdminPrivateLinks() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const statusOf = (p: Project) => {
    const expired = p.expiryDate ? new Date(p.expiryDate).getTime() < Date.now() : false;
    if (p.revoked) return { label: "Revoked", cls: "bg-red-100 text-red-600" };
    if (p.status === "disabled") return { label: "Disabled", cls: "bg-red-100 text-red-600" };
    if (expired) return { label: "Expired", cls: "bg-orange-100 text-orange-700" };
    return { label: "Active", cls: "bg-green-100 text-ok" };
  };

  return (
    <AdminLayout title="Private Links">
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-section/50 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Private URL</th>
                <th className="px-5 py-3 font-semibold">Access Code</th>
                <th className="px-5 py-3 font-semibold">Expiry</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    No private links yet.
                  </td>
                </tr>
              )}
              {projects.map((p) => {
                const url = `${window.location.origin}/design/${p.token}`;
                const status = statusOf(p);
                return (
                  <tr key={p.id} className="hover:bg-section/30">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{p.projectName}</p>
                      <p className="text-xs text-muted">{p.customerName}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">/design/{p.token}</td>
                    <td className="px-5 py-4 text-ink">
                      {p.accessCodeRequired ? p.accessCode : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copy(url)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-brown-dark/40"
                          title="Copy link"
                        >
                          <Copy size={13} />
                        </button>
                        <Link
                          to={`/admin/projects/${p.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-brown-dark/40"
                          title="View project"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
