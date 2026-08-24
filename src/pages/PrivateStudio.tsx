import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  MessageCircle,
  Shirt,
} from "lucide-react";
import { getProduct } from "../data/products";
import type { DesignImageLayer, DesignLayer, DesignTextLayer } from "../types";
import type { Design, Project } from "../types/admin";
import { useDesignHistory } from "../hooks/useDesignHistory";
import ProductViewer from "../components/customize/ProductViewer";
import ColorSelector from "../components/customize/ColorSelector";
import UploadPanel from "../components/customize/UploadPanel";
import TextEditor from "../components/customize/TextEditor";
import Toolbar from "../components/customize/Toolbar";
import { downloadDataUrl, exportDesignPNG } from "../utils/exportDesign";
import { buildWhatsAppMessage } from "../utils/buildWhatsappmessage";
import { STUDIO_WHATSAPP_NUMBER } from "../config/Studio";
import { PRODUCT_COLORS } from "../data/ProductColors";
import { getDesignForProject, saveDraftDesign, submitDesign } from "../lib/api";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function PrivateStudio({ project }: { project: Project }) {
  const product = useMemo(() => getProduct(project.productSlug), [project.productSlug]);

  const allowedColors = useMemo(
    () => PRODUCT_COLORS.filter((c) => project.allowedColors.includes(c.hex)),
    [project.allowedColors]
  );
  const defaultColor = allowedColors[0]?.hex ?? product.colors[0];

  const { state, commit, undo, redo, reset, checkpoint, canUndo, canRedo } = useDesignHistory({
    color: defaultColor,
    layers: [],
  });

  const [editSide, setEditSide] = useState<"front" | "back">("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [design, setDesign] = useState<Design | null>(null);
  const [mode, setMode] = useState<"loading" | "editor" | "status">("loading");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDesignForProject(project.token).then((d) => {
      setDesign(d);
      if (d.layers.length > 0 || d.color) {
        reset({ color: d.color || defaultColor, layers: d.layers });
      }
      setMode(d.status === "DRAFT" ? "editor" : "status");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.token]);

  const selectedLayer = state.layers.find((l) => l.id === selectedId) || null;

  const handleColorChange = (color: string) => commit((prev) => ({ ...prev, color }));

  const handleUpload = (dataUrl: string) => {
    const layer: DesignImageLayer = {
      id: uid(),
      type: "image",
      src: dataUrl,
      x: 50,
      y: 45,
      width: 30,
      height: 30,
      rotation: 0,
      side: editSide,
    };
    commit((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelectedId(layer.id);
  };

  const handleAddText = (
    text: string,
    font: string,
    fontSize: number,
    bold: boolean,
    italic: boolean,
    color: string
  ) => {
    const layer: DesignTextLayer = {
      id: uid(),
      type: "text",
      text,
      font,
      size: fontSize,
      bold,
      italic,
      color,
      x: 50,
      y: 50,
      rotation: 0,
      side: editSide,
    };
    commit((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelectedId(layer.id);
  };

  const handleLayerChange = (id: string, patch: Partial<DesignLayer>) => {
    commit(
      (prev) => ({
        ...prev,
        layers: prev.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)),
      }),
      false
    );
  };

  const handleLayerCommit = () => {};

  const deleteSelected = () => {
    if (!selectedId) return;
    commit((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== selectedId) }));
    setSelectedId(null);
  };

  const deleteAll = () => {
    commit((prev) => ({ ...prev, layers: [] }));
    setSelectedId(null);
  };

  const generatePreview = async () => {
    try {
      return await exportDesignPNG(product.front, state.color, state.layers, "front");
    } catch {
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const baseImage = editSide === "front" ? product.front : product.back;
      const dataUrl = await exportDesignPNG(baseImage, state.color, state.layers, editSide);
      downloadDataUrl(dataUrl, `${project.projectName || product.slug}-${editSide}-design.png`);
      toast.success("Design downloaded.");
    } catch {
      toast.error("Could not generate download.");
    }
  };

  const handleRequestQuote = () => {
    const message = buildWhatsAppMessage({
      customerName: project.customerName,
      productName: `${product.name} — ${project.projectName}`,
      color: state.color,
      layers: state.layers,
    });
    const href = `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const preview = await generatePreview();
    const saved = await saveDraftDesign(project.token, state.color, state.layers, preview);
    setDesign(saved);
    setSaving(false);
    toast.success("Draft saved.");
  };

  const handleSubmit = async () => {
    if (state.layers.length === 0) {
      toast.error("Add at least one design element before submitting.");
      return;
    }
    setSubmitting(true);
    const preview = await generatePreview();
    const saved = await submitDesign(project.token, state.color, state.layers, preview);
    setDesign(saved);
    setSubmitting(false);
    setMode("status");
    toast.success("Design submitted for review.");
  };

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-brown-dark" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Minimal private-studio header — intentionally not the public site nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
              Private Design Studio
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{project.projectName}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Customer:</span>
            <span className="font-medium text-ink">{project.customerName}</span>
            <span className="mx-1 text-line">|</span>
            <span className="text-muted">Status:</span>
            <StatusPill status={design?.status ?? "DRAFT"} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {mode === "status" && design ? (
          <StatusScreen
            design={design}
            onEdit={() => setMode("editor")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.25fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 space-y-6 lg:order-1"
            >
              <div className="card-premium p-6">
                <div className="flex items-center gap-2">
                  <Shirt size={15} className="text-brown-dark" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                    Product
                  </h3>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Type</span>
                  <span className="text-sm font-semibold text-ink">{product.name}</span>
                </div>
                <p className="mt-4 text-xs text-muted">
                  Only colors approved for this project are shown.
                </p>
                <div className="mt-3">
                  <ColorSelector value={state.color} onChange={handleColorChange} colors={allowedColors} />
                </div>
              </div>

              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                Design
              </p>

              <div className="card-premium p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                  Upload Artwork
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Adding to the <strong className="capitalize text-ink">{editSide}</strong> side.
                </p>
                <div className="mt-4">
                  <UploadPanel side={editSide} onUpload={handleUpload} />
                </div>
              </div>

              <div className="card-premium p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                  Add Text
                </h3>
                <div className="mt-4">
                  <TextEditor onAdd={handleAddText} />
                </div>
              </div>

              {selectedLayer && (
                <div className="card-premium p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                    Selected {selectedLayer.type === "text" ? "Text" : "Image"}
                  </h3>
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-xs text-muted">Scale</label>
                    <input
                      type="range"
                      min={selectedLayer.type === "image" ? 6 : 10}
                      max={selectedLayer.type === "image" ? 80 : 160}
                      value={selectedLayer.type === "image" ? selectedLayer.width : selectedLayer.size}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (selectedLayer.type === "image") {
                          const ratio = selectedLayer.height / selectedLayer.width;
                          handleLayerChange(selectedLayer.id, { width: v, height: v * ratio });
                        } else {
                          handleLayerChange(selectedLayer.id, { size: v });
                        }
                      }}
                      onPointerDown={checkpoint}
                      className="flex-1 accent-gold"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs text-muted">Rotation</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedLayer.rotation}
                      onChange={(e) => handleLayerChange(selectedLayer.id, { rotation: Number(e.target.value) })}
                      onPointerDown={checkpoint}
                      className="flex-1 accent-gold"
                    />
                  </div>
                </div>
              )}

              <div className="card-premium p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                  Tools
                </h3>
                <Toolbar
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onDeleteSelected={deleteSelected}
                  hasSelection={!!selectedId}
                  onDeleteAll={deleteAll}
                  onDownload={handleDownload}
                />
              </div>

              <div className="card-premium space-y-2.5 p-6">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                  Actions
                </h3>
                <button
                  onClick={handleRequestQuote}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.01]"
                >
                  <MessageCircle size={16} /> Send Design / Request Quote
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brown-dark py-3.5 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Submit Design
                </button>
                <p className="pt-1 text-center text-[11px] text-muted">
                  Download your preview or send it on WhatsApp any time — submit when you're ready
                  for Prime Attaire to review and quote your order.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-1 self-start lg:sticky lg:top-24 lg:order-2"
            >
              <div className="card-premium p-6 md:p-8">
                <ProductViewer
                  product={product}
                  color={state.color}
                  layers={state.layers}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onChange={handleLayerChange}
                  onCommit={handleLayerCommit}
                  onGestureStart={checkpoint}
                  editSide={editSide}
                  onEditSideChange={setEditSide}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <footer className="border-t border-line py-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
        Private project · Access provided by Prime Attaire
      </footer>
    </div>
  );
}

function StatusPill({ status }: { status: Design["status"] }) {
  const map: Record<Design["status"], { label: string; cls: string }> = {
    DRAFT: { label: "Draft", cls: "bg-line text-muted" },
    SUBMITTED: { label: "Pending Review", cls: "bg-gold/20 text-brown-dark" },
    REVISION_REQUIRED: { label: "Revision Required", cls: "bg-orange-100 text-orange-700" },
    APPROVED: { label: "Approved", cls: "bg-green-100 text-ok" },
    REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = map[status];
  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function StatusScreen({ design, onEdit }: { design: Design; onEdit: () => void }) {
  if (design.status === "SUBMITTED") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-brown-dark">
          <Clock size={24} />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold text-ink">Design Submitted</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your design has been successfully submitted. Prime Attaire will review your design and
          get back to you.
        </p>
        <div className="mt-6">
          <StatusPill status="SUBMITTED" />
        </div>
        {design.previewDataUrl && (
          <img
            src={design.previewDataUrl}
            alt="Submitted design preview"
            className="mx-auto mt-8 max-w-xs rounded-xl2 border border-line"
          />
        )}
      </div>
    );
  }

  if (design.status === "REVISION_REQUIRED") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Pencil size={22} />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold text-ink">Revision Required</h2>
        {design.adminFeedback && (
          <p className="mx-auto mt-4 max-w-sm rounded-xl2 border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            “{design.adminFeedback}”
          </p>
        )}
        <button
          onClick={onEdit}
          className="mx-auto mt-8 flex items-center justify-center gap-2 rounded-full bg-brown-dark px-8 py-3.5 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01]"
        >
          <Pencil size={15} /> Edit Design
        </button>
      </div>
    );
  }

  if (design.status === "APPROVED") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-ok">
          <CheckCircle2 size={24} />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold text-ink">Design Approved</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Great news — your design has been approved. Prime Attaire will contact you via WhatsApp
          to finalize production details.
        </p>
        {design.previewDataUrl && (
          <img
            src={design.previewDataUrl}
            alt="Approved design preview"
            className="mx-auto mt-8 max-w-xs rounded-xl2 border border-line"
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <XCircle size={24} />
      </span>
      <h2 className="mt-6 font-display text-2xl font-semibold text-ink">Design Rejected</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Prime Attaire was unable to approve this design. Please contact us for more details.
      </p>
      {design.adminFeedback && (
        <p className="mx-auto mt-4 max-w-sm rounded-xl2 border border-line bg-bg p-4 text-sm text-ink">
          “{design.adminFeedback}”
        </p>
      )}
    </div>
  );
}
