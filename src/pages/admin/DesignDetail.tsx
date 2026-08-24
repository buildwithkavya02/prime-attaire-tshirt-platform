import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getDesign, updateDesignStatus } from "../../lib/api";
import type { Design, Project } from "../../types/admin";
import { getProduct } from "../../data/products";
import { getColorLabel } from "../../data/ProductColors";
import { exportDesignPNG } from "../../utils/exportDesign";

const statusColors: Record<string, string> = {
  DRAFT: "bg-line text-muted",
  SUBMITTED: "bg-gold/20 text-brown-dark",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-ok",
  REJECTED: "bg-red-100 text-red-600",
};

export default function AdminDesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<(Design & { project?: Project }) | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!id) return;
    getDesign(id).then(async (d) => {
      if (!d) {
        toast.error("Design not found.");
        navigate("/admin/designs");
        return;
      }
      setDesign(d);
      setFeedback(d.adminFeedback ?? "");
      if (d.project) {
        const product = getProduct(d.project.productSlug);
        try {
          const [front, back] = await Promise.all([
            exportDesignPNG(product.front, d.color || product.colors[0], d.layers, "front"),
            exportDesignPNG(product.back, d.color || product.colors[0], d.layers, "back"),
          ]);
          setFrontPreview(front);
          setBackPreview(back);
        } catch {
          /* preview generation best-effort only */
        }
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!design) {
    return (
      <AdminLayout title="Design Review">
        <p className="text-sm text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  const doUpdate = async (status: Design["status"], fb?: string | null) => {
    setBusy(true);
    const updated = await updateDesignStatus(design.id, status, fb);
    setBusy(false);
    if (updated) {
      setDesign({ ...design, ...updated });
      toast.success("Design updated.");
      setShowRevisionForm(false);
    }
  };

  const textLayers = design.layers.filter((l) => l.type === "text");
  const imageLayers = design.layers.filter((l) => l.type === "image");

  return (
    <AdminLayout title="Design Review">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card-premium p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Front</p>
              {frontPreview ? (
                <img src={frontPreview} alt="Front design preview" className="w-full rounded-xl2" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-xl2 bg-section text-xs text-muted">
                  Generating preview…
                </div>
              )}
            </div>
            <div className="card-premium p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Back</p>
              {backPreview ? (
                <img src={backPreview} alt="Back design preview" className="w-full rounded-xl2" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-xl2 bg-section text-xs text-muted">
                  Generating preview…
                </div>
              )}
            </div>
          </div>

          <div className="card-premium p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
              Design Summary
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Color</dt>
                <dd className="mt-1 font-medium text-ink">{getColorLabel(design.color)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Text Layers</dt>
                <dd className="mt-1 font-medium text-ink">{textLayers.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Uploaded Artwork</dt>
                <dd className="mt-1 font-medium text-ink">{imageLayers.length}</dd>
              </div>
            </dl>
            {textLayers.length > 0 && (
              <div className="mt-4 space-y-1.5 rounded-xl2 border border-line bg-bg p-4 text-sm">
                {textLayers.map((l) =>
                  l.type === "text" ? (
                    <p key={l.id} className="text-ink">
                      “{l.text}” <span className="text-xs text-muted">({l.side})</span>
                    </p>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-96">
          <div className="card-premium p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
              Customer Information
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Customer</dt>
                <dd className="text-ink">{design.project?.customerName ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Project</dt>
                <dd className="text-right text-ink">{design.project?.projectName ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Product</dt>
                <dd className="text-ink">
                  {design.project ? getProduct(design.project.productSlug).name : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Submitted</dt>
                <dd className="text-ink">
                  {design.submittedAt ? new Date(design.submittedAt).toLocaleString() : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">Status</h3>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[design.status]}`}>
                {design.status.replace("_", " ")}
              </span>
            </div>
            {design.adminFeedback && (
              <p className="mt-3 rounded-xl2 border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                {design.adminFeedback}
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                disabled={busy}
                onClick={() => doUpdate("APPROVED")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brown-dark py-3 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01] disabled:opacity-50"
              >
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                disabled={busy}
                onClick={() => setShowRevisionForm((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-semibold text-ink hover:border-brown-dark/40 disabled:opacity-50"
              >
                <RotateCcw size={15} /> Request Revision
              </button>
              <button
                disabled={busy}
                onClick={() => doUpdate("REJECTED")}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={15} /> Reject
              </button>
            </div>

            {showRevisionForm && (
              <div className="mt-4 space-y-3 rounded-xl2 border border-line bg-bg p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Please move the logo slightly upward."
                  className="w-full resize-none rounded-xl2 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                />
                <button
                  disabled={busy || !feedback.trim()}
                  onClick={() => doUpdate("REVISION_REQUIRED", feedback.trim())}
                  className="w-full rounded-full bg-brown-dark py-2.5 text-sm font-semibold text-gold disabled:opacity-50"
                >
                  Send Revision Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
