// import { useEffect, useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { MessageCircle, ChevronDown } from "lucide-react";
// import toast from "react-hot-toast";
// import { PRODUCTS, getProduct } from "../data/products";
// import type { DesignImageLayer, DesignLayer, DesignTextLayer, ProductSlug } from "../types";
// import { useDesignHistory } from "../hooks/useDesignHistory";
// import ProductViewer from "../components/customize/ProductViewer";
// // import ColorPicker from "../components/customize/ColorPicker";
// import UploadPanel from "../components/customize/UploadPanel";
// import TextEditor from "../components/customize/TextEditor";
// import Toolbar from "../components/customize/Toolbar";
// import { downloadDataUrl, exportDesignPNG } from "../utils/exportDesign";

// const uid = () => Math.random().toString(36).slice(2, 10);

// export default function Customize() {
//   const { productSlug } = useParams();
//   const navigate = useNavigate();
//   const product = useMemo(() => getProduct(productSlug), [productSlug]);

//   const { state, commit, undo, redo, reset, checkpoint, canUndo, canRedo } = useDesignHistory({
//     color: product.colors[0],
//     layers: [],
//   });

//   const [editSide, setEditSide] = useState<"front" | "back">("front");
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [customerName, setCustomerName] = useState("");

//   // reset design when switching product
//   useEffect(() => {
//     reset({ color: product.colors[0], layers: [] });
//     setSelectedId(null);
//     setEditSide("front");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [product.slug]);

//   const selectedLayer = state.layers.find((l) => l.id === selectedId) || null;

//   const handleProductChange = (slug: ProductSlug) => {
//     navigate(`/customize/${slug}`);
//   };

//   const handleColorChange = (color: string) => {
//     commit((prev) => ({ ...prev, color }));
//   };

//   const handleUpload = (dataUrl: string) => {
//     const layer: DesignImageLayer = {
//       id: uid(),
//       type: "image",
//       src: dataUrl,
//       x: 50,
//       y: 45,
//       width: 30,
//       height: 30,
//       rotation: 0,
//       side: editSide,
//     };
//     commit((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
//     setSelectedId(layer.id);
//   };

//   const handleAddText = (
//     text: string,
//     font: string,
//     bold: boolean,
//     italic: boolean,
//     color: string
//   ) => {
//     const layer: DesignTextLayer = {
//       id: uid(),
//       type: "text",
//       text,
//       font,
//       size: 28,
//       bold,
//       italic,
//       color,
//       x: 50,
//       y: 50,
//       rotation: 0,
//       side: editSide,
//     };
//     commit((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
//     setSelectedId(layer.id);
//   };

//   // live-drag updates without spamming history; committed on pointer-up via onCommit
//   const handleLayerChange = (id: string, patch: Partial<DesignLayer>) => {
//     commit(
//       (prev) => ({
//         ...prev,
//         layers: prev.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)),
//       }),
//       false
//     );
//   };

//   // no-op: history checkpoints are taken at gesture START via `checkpoint()`,
//   // so nothing needs to happen when a drag/resize/rotate gesture ends.
//   const handleLayerCommit = () => {};

//   const deleteSelected = () => {
//     if (!selectedId) return;
//     commit((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== selectedId) }));
//     setSelectedId(null);
//   };

//   const deleteAll = () => {
//     commit((prev) => ({ ...prev, layers: [] }));
//     setSelectedId(null);
//   };

//   const handleDownload = async () => {
//     try {
//       const dataUrl = await exportDesignPNG(
//         editSide === "front" ? product.front : product.back,
//         state.color,
//         state.layers,
//         editSide
//       );
//       downloadDataUrl(dataUrl, `${product.slug}-${editSide}-design.png`);
//       toast.success("Preview downloaded");
//     } catch {
//       toast.error("Could not generate preview");
//     }
//   };

//   const handleWhatsApp = () => {
//     const textLayers = state.layers.filter((l): l is DesignTextLayer => l.type === "text");
//     const lines = [
//       "Hello, I have completed my custom T-Shirt design.",
//       "Please review my design and provide pricing details.",
//       "",
//       `Customer Name: ${customerName || "—"}`,
//       `Selected Product: ${product.name}`,
//       `Product Color: ${state.color}`,
//       textLayers.length
//         ? `Custom Text: ${textLayers.map((t) => t.text).join(", ")}`
//         : "Custom Text: —",
//       `Uploaded Design Layers: ${state.layers.filter((l) => l.type === "image").length}`,
//       "",
//       "(Preview image downloaded separately and will be attached here.)",
//     ];
//     const href = `https://wa.me/9962605619?text=${encodeURIComponent(lines.join("\n"))}`;
//     window.open(href, "_blank");
//   };

//   return (
//     <div className="pt-24 md:pt-28 pb-24">
//       <div className="container-lux">
//         <div className="flex flex-col gap-2 py-8">
//           <span className="eyebrow">
//             <span className="h-px w-6 bg-gold" />
//             Design Studio
//           </span>
//           <div className="flex flex-wrap items-end justify-between gap-4">
//             <h1 className="text-3xl md:text-4xl font-semibold">{product.name}</h1>
//             <div className="relative">
//               <select
//                 value={product.slug}
//                 onChange={(e) => handleProductChange(e.target.value as ProductSlug)}
//                 className="appearance-none rounded-full border border-line bg-white py-3 pl-5 pr-10 text-sm font-medium outline-none focus:border-gold"
//               >
//                 {PRODUCTS.map((p) => (
//                   <option key={p.slug} value={p.slug}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-8">
//           {/* Left: editing panel */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="order-2 lg:order-1 space-y-6"
//           >
//             <div className="card-premium p-6">
//               <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                 Product Color
//               </h3>
//               {/* <div className="mt-4">
//                 <ColorPicker colors={product.colors} value={state.color} onChange={handleColorChange} />
//               </div> */}
//             </div>

//             <div className="card-premium p-6">
//               <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                 Upload Artwork
//               </h3>
//               <p className="mt-1 text-xs text-muted">
//                 Adding to the <strong className="text-ink capitalize">{editSide}</strong> side.
//                 Switch sides using the toggle under the preview.
//               </p>
//               <div className="mt-4">
//                 <UploadPanel side={editSide} onUpload={handleUpload} />
//               </div>
//             </div>

//             <div className="card-premium p-6">
//               <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                 Add Text
//               </h3>
//               <div className="mt-4">
//                 <TextEditor onAdd={handleAddText} />
//               </div>
//             </div>

//             {selectedLayer && (
//               <div className="card-premium p-6">
//                 <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                   Selected {selectedLayer.type === "text" ? "Text" : "Image"}
//                 </h3>
//                 <div className="mt-4 flex items-center gap-3">
//                   <label className="text-xs text-muted">Scale</label>
//                   <input
//                     type="range"
//                     min={selectedLayer.type === "image" ? 6 : 10}
//                     max={selectedLayer.type === "image" ? 80 : 160}
//                     value={selectedLayer.type === "image" ? selectedLayer.width : selectedLayer.size}
//                     onChange={(e) => {
//                       const v = Number(e.target.value);
//                       if (selectedLayer.type === "image") {
//                         const ratio = selectedLayer.height / selectedLayer.width;
//                         handleLayerChange(selectedLayer.id, { width: v, height: v * ratio });
//                       } else {
//                         handleLayerChange(selectedLayer.id, { size: v });
//                       }
//                     }}
//                     onPointerDown={checkpoint}
//                     className="flex-1 accent-gold"
//                   />
//                 </div>
//                 <div className="mt-3 flex items-center gap-3">
//                   <label className="text-xs text-muted">Rotation</label>
//                   <input
//                     type="range"
//                     min={-180}
//                     max={180}
//                     value={selectedLayer.rotation}
//                     onChange={(e) => handleLayerChange(selectedLayer.id, { rotation: Number(e.target.value) })}
//                     onPointerDown={checkpoint}
//                     className="flex-1 accent-gold"
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="card-premium p-6">
//               <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                 Tools
//               </h3>
//               <Toolbar
//                 onUndo={undo}
//                 onRedo={redo}
//                 canUndo={canUndo}
//                 canRedo={canRedo}
//                 onDeleteSelected={deleteSelected}
//                 hasSelection={!!selectedId}
//                 onDeleteAll={deleteAll}
//                 onDownload={handleDownload}
//               />
//             </div>

//             <div className="card-premium p-6">
//               <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
//                 Send to Studio
//               </h3>
//               <input
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//                 placeholder="Your name"
//                 className="mt-4 w-full rounded-full border border-line bg-bg px-5 py-3 text-sm outline-none focus:border-gold"
//               />
//               <button
//                 onClick={handleWhatsApp}
//                 className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.01]"
//               >
//                 <MessageCircle size={16} /> Send Design on WhatsApp
//               </button>
//               <p className="mt-3 text-[11px] leading-relaxed text-muted">
//                 Download your preview first, then attach it in WhatsApp alongside the auto-filled
//                 summary of your design.
//               </p>
//             </div>
//           </motion.div>

//           {/* Right: live viewer */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="order-1 lg:order-2 lg:sticky lg:top-28 self-start"
//           >
//             <div className="card-premium p-6 md:p-8">
//               <ProductViewer
//                 product={product}
//                 color={state.color}
//                 layers={state.layers}
//                 selectedId={selectedId}
//                 onSelect={setSelectedId}
//                 onChange={handleLayerChange}
//                 onCommit={handleLayerCommit}
//                 onGestureStart={checkpoint}
//                 editSide={editSide}
//                 onEditSideChange={setEditSide}
//               />
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { PRODUCTS, getProduct } from "../data/products";
import { getPublicProducts } from "../lib/api";
import type { DesignImageLayer, DesignLayer, DesignTextLayer, Product } from "../types";
import { useDesignHistory } from "../hooks/useDesignHistory";
import ProductViewer from "../components/customize/ProductViewer";
import ColorSelector from "../components/customize/ColorSelector";
import UploadPanel from "../components/customize/UploadPanel";
import TextEditor from "../components/customize/TextEditor";
import Toolbar from "../components/customize/Toolbar";
import { downloadDataUrl, exportDesignPNG } from "../utils/exportDesign";
import { buildWhatsAppMessage } from "../utils/buildWhatsappmessage";
import { getColorLabel } from "../data/ProductColors";
import { STUDIO_WHATSAPP_NUMBER } from "../config/Studio";
import { PRODUCT_COLORS } from "../data/ProductColors";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Customize() {
  const { productSlug } = useParams();
  const navigate = useNavigate();

  // The live catalog (admin-managed, same source of truth as the Products
  // page) is the primary source. The small static list only covers this
  // page if the API is unreachable, so the design studio never hard-fails.
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getPublicProducts()
      .then((data) => {
        if (!cancelled && data.length) setLiveProducts(data);
      })
      .catch(() => {
        /* fall back to the static catalog below */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog: Product[] = liveProducts && liveProducts.length ? liveProducts : PRODUCTS;
  const product = useMemo(
    () => catalog.find((p) => p.slug === productSlug) ?? catalog[0] ?? getProduct(productSlug),
    [catalog, productSlug]
  );

  const { state, commit, undo, redo, reset, checkpoint, canUndo, canRedo } = useDesignHistory({
    color: PRODUCT_COLORS[0].hex,
    layers: [],
  });

  const [editSide, setEditSide] = useState<"front" | "back">("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");

  // reset design when switching product
  useEffect(() => {
    reset({ color: PRODUCT_COLORS[0].hex, layers: [] });
    setSelectedId(null);
    setEditSide("front");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const selectedLayer = state.layers.find((l) => l.id === selectedId) || null;

  const handleProductChange = (slug: string) => {
    navigate(`/customize/${slug}`);
  };

  const handleColorChange = (color: string) => {
    commit((prev) => ({ ...prev, color }));
  };

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

  // live-drag updates without spamming history; committed on pointer-up via onCommit
  const handleLayerChange = (id: string, patch: Partial<DesignLayer>) => {
    commit(
      (prev) => ({
        ...prev,
        layers: prev.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)),
      }),
      false
    );
  };

  // no-op: history checkpoints are taken at gesture START via `checkpoint()`,
  // so nothing needs to happen when a drag/resize/rotate gesture ends.
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

  const handleDownload = async () => {
    try {
      const dataUrl = await exportDesignPNG(
        editSide === "front" ? product.front : product.back,
        state.color,
        state.layers,
        editSide
      );
      downloadDataUrl(dataUrl, `${product.slug}-${editSide}-design.png`);
      toast.success("Preview downloaded");
    } catch {
      toast.error("Could not generate preview");
    }
  };

  const handleWhatsApp = () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name before sending your design.");
      return;
    }

    const message = buildWhatsAppMessage({
      customerName: customerName.trim(),
      productName: product.name,
      color: state.color,
      layers: state.layers,
    });

    const href = `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(href, "_blank");
  };

  return (
    <div className="pt-24 md:pt-28 pb-24">
      <div className="container-lux">
        <div className="flex flex-col gap-2 py-8">
          <span className="eyebrow">
            <span className="h-px w-6 bg-gold" />
            Design Studio
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-semibold">{product.name}</h1>
            <div className="relative">
              <select
                value={product.slug}
                onChange={(e) => handleProductChange(e.target.value)}
                className="appearance-none rounded-full border border-line bg-white py-3 pl-5 pr-10 text-sm font-medium outline-none focus:border-gold"
              >
                {catalog.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-8">
          {/* Left: editing panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 space-y-6"
          >
            <div className="card-premium p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                Product Color
              </h3>
              <div className="mt-4">
                <ColorSelector value={state.color} onChange={handleColorChange} />
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                Upload Artwork
              </h3>
              <p className="mt-1 text-xs text-muted">
                Adding to the <strong className="text-ink capitalize">{editSide}</strong> side.
                Switch sides using the toggle under the preview.
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

                {selectedLayer.type === "text" && (
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-line bg-bg px-4 py-3 text-xs">
                    <dt className="text-muted">Font</dt>
                    <dd className="text-right text-ink">{selectedLayer.font.replace(/'/g, "").split(",")[0]}</dd>
                    <dt className="text-muted">Size</dt>
                    <dd className="text-right text-ink">{selectedLayer.size}px</dd>
                    <dt className="text-muted">Bold</dt>
                    <dd className="text-right text-ink">{selectedLayer.bold ? "On" : "Off"}</dd>
                    <dt className="text-muted">Italic</dt>
                    <dd className="text-right text-ink">{selectedLayer.italic ? "On" : "Off"}</dd>
                    <dt className="text-muted">Color</dt>
                    <dd className="text-right text-ink">{getColorLabel(selectedLayer.color)}</dd>
                  </dl>
                )}

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

            <div className="card-premium p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                Send to Studio
              </h3>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="mt-4 w-full rounded-full border border-line bg-bg px-5 py-3 text-sm outline-none focus:border-gold"
              />
              <button
                onClick={handleWhatsApp}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.01]"
              >
                <MessageCircle size={16} /> Send Design on WhatsApp
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Download your preview first, then attach it in WhatsApp alongside the auto-filled
                summary of your design.
              </p>
            </div>
          </motion.div>

          {/* Right: live viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 lg:sticky lg:top-28 self-start"
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
      </div>
    </div>
  );
}
