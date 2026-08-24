import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Clock, CheckCircle2, Link2, ArrowUpRight } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getDashboardStats } from "../../lib/api";
import type { Design, Project } from "../../types/admin";

interface Stats {
  activeProjects: number;
  pendingDesigns: number;
  approvedDesigns: number;
  activeLinks: number;
  recentProjects: Project[];
  recentDesigns: (Design & { project?: Project })[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-line text-muted",
  SUBMITTED: "bg-gold/20 text-brown-dark",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-ok",
  REJECTED: "bg-red-100 text-red-600",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const cards = [
    { label: "Active Projects", value: stats?.activeProjects, icon: FolderKanban },
    { label: "Pending Designs", value: stats?.pendingDesigns, icon: Clock },
    { label: "Approved Designs", value: stats?.approvedDesigns, icon: CheckCircle2 },
    { label: "Active Private Links", value: stats?.activeLinks, icon: Link2 },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-section text-brown-dark">
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{value ?? "—"}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
              Recent Projects
            </h3>
            <Link
              to="/admin/projects"
              className="flex items-center gap-1 text-xs font-semibold text-brown-dark hover:text-gold"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {stats?.recentProjects.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">No projects yet.</p>
            )}
            {stats?.recentProjects.map((p) => (
              <Link
                key={p.id}
                to={`/admin/projects/${p.id}`}
                className="flex items-center justify-between py-3 text-sm hover:text-brown-dark"
              >
                <div>
                  <p className="font-medium text-ink">{p.projectName}</p>
                  <p className="text-xs text-muted">{p.customerName}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                    p.revoked || p.status === "disabled"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-ok"
                  }`}
                >
                  {p.revoked ? "Revoked" : p.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
              Recent Design Submissions
            </h3>
            <Link
              to="/admin/designs"
              className="flex items-center gap-1 text-xs font-semibold text-brown-dark hover:text-gold"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {stats?.recentDesigns.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">No submissions yet.</p>
            )}
            {stats?.recentDesigns.map((d) => (
              <Link
                key={d.id}
                to={`/admin/designs/${d.id}`}
                className="flex items-center justify-between py-3 text-sm hover:text-brown-dark"
              >
                <div>
                  <p className="font-medium text-ink">{d.project?.projectName ?? "Unknown project"}</p>
                  <p className="text-xs text-muted">{d.project?.customerName}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[d.status]}`}
                >
                  {d.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
