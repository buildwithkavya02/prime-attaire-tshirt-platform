import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Copy,
  ExternalLink,
  MessageCircle,
  RefreshCcw,
  ShieldOff,
  ShieldCheck,
  Pencil,
  Ban,
  PlayCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getProject,
  getSettings,
  regenerateAccessCode,
  revokeProject,
  setProjectStatus,
} from "../../lib/api";
import type { Project, StudioSettings } from "../../types/admin";
import { getProduct } from "../../data/products";
import { getColorLabel } from "../../data/ProductColors";

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    getProject(id).then((p) => {
      if (!p) {
        toast.error("Project not found.");
        navigate("/admin/projects");
        return;
      }
      setProject(p);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    getSettings().then(setSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !project) {
    return (
      <AdminLayout title="Project">
        <p className="text-sm text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  const privateUrl = `${window.location.origin}/design/${project.token}`;
  const product = getProduct(project.productSlug);
  const isRevoked = project.revoked;
  const isDisabled = project.status === "disabled";
  const isExpired = project.expiryDate ? new Date(project.expiryDate).getTime() < Date.now() : false;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const accessDetailsText = [
    `Project: ${project.projectName}`,
    `Private Link: ${privateUrl}`,
    project.accessCodeRequired ? `Access Code: ${project.accessCode}` : "Access Code: Not required",
    project.expiryDate ? `Expires: ${new Date(project.expiryDate).toLocaleDateString()}` : "No expiry",
  ].join("\n");

  const handleRevoke = async (next: boolean) => {
    const updated = await revokeProject(project.id, next);
    if (updated) {
      setProject(updated);
      toast.success(next ? "Link revoked" : "Link reactivated");
    }
  };

  const handleDisableToggle = async () => {
    const updated = await setProjectStatus(project.id, isDisabled ? "active" : "disabled");
    if (updated) {
      setProject(updated);
      toast.success(isDisabled ? "Project enabled" : "Project disabled");
    }
  };

  const handleRegenerateCode = async () => {
    const updated = await regenerateAccessCode(project.id);
    if (updated) {
      setProject(updated);
      toast.success("New access code generated");
    }
  };

  const handleWhatsApp = () => {
    const number = settings?.whatsappNumber ?? "";
    const lines = [
      settings?.defaultCustomerMessage || "Hello! Your private design project is ready.",
      "",
      `Customer: ${project.customerName}`,
      `Project: ${project.projectName}`,
      `Private Link: ${privateUrl}`,
      project.accessCodeRequired ? `Access Code: ${project.accessCode}` : "",
      project.expiryDate ? `Valid until: ${new Date(project.expiryDate).toLocaleDateString()}` : "",
    ].filter(Boolean);
    const href = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(href, "_blank");
  };

  return (
    <AdminLayout title="Project Detail">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="card-premium p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{project.projectName}</h2>
                <p className="mt-1 text-sm text-muted">{project.customerName} · {project.customerPhone}</p>
              </div>
              <Link
                to={`/admin/projects/${project.id}/edit`}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-brown-dark/40"
              >
                <Pencil size={13} /> Edit
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Product</dt>
                <dd className="mt-1 font-medium text-ink">{product.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Expiry</dt>
                <dd className="mt-1 font-medium text-ink">
                  {project.expiryDate ? new Date(project.expiryDate).toLocaleDateString() : "No expiry"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                      isRevoked || isDisabled || isExpired
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-ok"
                    }`}
                  >
                    {isRevoked ? "Revoked" : isDisabled ? "Disabled" : isExpired ? "Expired" : "Active"}
                  </span>
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Allowed Colors</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {project.allowedColors.map((hex) => (
                    <span
                      key={hex}
                      className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3 text-xs text-ink"
                    >
                      <span className="h-4 w-4 rounded-full ring-1 ring-line" style={{ backgroundColor: hex }} />
                      {getColorLabel(hex)}
                    </span>
                  ))}
                </dd>
              </div>
              {project.notes && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-xs uppercase tracking-wide text-muted">Notes</dt>
                  <dd className="mt-1 text-ink">{project.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-96">
          <div className="card-premium p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
              Private Link
            </h3>
            <p className="mt-3 break-all rounded-xl2 border border-line bg-bg px-4 py-3 text-xs text-ink">
              {privateUrl}
            </p>

            {project.accessCodeRequired && (
              <div className="mt-3 flex items-center justify-between rounded-xl2 border border-line bg-bg px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Access Code</p>
                  <p className="text-lg font-semibold tracking-widest text-ink">{project.accessCode}</p>
                </div>
                <button
                  onClick={handleRegenerateCode}
                  className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-ink hover:border-brown-dark/40"
                >
                  <RefreshCcw size={12} /> Regenerate
                </button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => copy(privateUrl, "Link")}
                className="flex items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-xs font-semibold text-ink hover:border-brown-dark/40"
              >
                <Copy size={13} /> Copy Link
              </button>
              <button
                onClick={() => copy(accessDetailsText, "Access details")}
                className="flex items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-xs font-semibold text-ink hover:border-brown-dark/40"
              >
                <Copy size={13} /> Copy Details
              </button>
              <a
                href={`/design/${project.token}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-xs font-semibold text-ink hover:border-brown-dark/40"
              >
                <ExternalLink size={13} /> Open
              </a>
              <button
                onClick={() => handleRevoke(!isRevoked)}
                className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold ${
                  isRevoked
                    ? "border border-line text-ink hover:border-brown-dark/40"
                    : "border border-red-200 text-red-600 hover:bg-red-50"
                }`}
              >
                {isRevoked ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                {isRevoked ? "Reactivate" : "Revoke"}
              </button>
            </div>

            <button
              onClick={handleWhatsApp}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.01]"
            >
              <MessageCircle size={15} /> Send via WhatsApp
            </button>

            <button
              onClick={handleDisableToggle}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-xs font-semibold text-ink hover:border-brown-dark/40"
            >
              {isDisabled ? <PlayCircle size={13} /> : <Ban size={13} />}
              {isDisabled ? "Enable Project" : "Disable Project"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
