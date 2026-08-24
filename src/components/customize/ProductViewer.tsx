import { useEffect, useRef, useState } from "react";
import { RotateCw, Play, Pause, Loader2 } from "lucide-react";
import type { DesignLayer, Product } from "../../types";
import DesignCanvas from "./DesignCanvas";

interface Props {
  product: Product;
  color: string;
  layers: DesignLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<DesignLayer>) => void;
  onCommit: () => void;
  onGestureStart: () => void;
  editSide: "front" | "back";
  onEditSideChange: (side: "front" | "back") => void;
}

const VIEWS = [
  { label: "Front", angle: 0 },
  { label: "Right", angle: 90 },
  { label: "Back", angle: 180 },
  { label: "Left", angle: 270 },
];

export default function ProductViewer({
  product,
  color,
  layers,
  selectedId,
  onSelect,
  onChange,
  onCommit,
  onGestureStart,
  editSide,
  onEditSideChange,
}: Props) {
  const [angle, setAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Subtle "professional loading" state while the front/back base images
  // load, so the 360 viewer never flashes an empty/broken frame on mount
  // or when the product/color assets change.
  const [imagesReady, setImagesReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setImagesReady(false);
    const sources = [product.front, product.back];
    Promise.all(
      sources.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      if (!cancelled) setImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [product.front, product.back]);

  useEffect(() => {
    if (!autoRotate) return;
    const tick = () => {
      setAngle((a) => (a + 0.6) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoRotate]);

  // determine which base image + editable side is showing
  const norm = ((angle % 360) + 360) % 360;
  const showingBack = norm > 90 && norm < 270;
  const displaySide: "front" | "back" = showingBack ? "back" : "front";
  const baseImage = displaySide === "front" ? product.front : product.back;

  // fake depth: scale narrows near 90/270 to suggest turning. Kept well
  // above 0 so the garment never thins out to a sliver/black edge — the
  // silhouette + shading always reads as a full, centered product.
  const distanceFromFlat = Math.min(
    Math.abs(norm - 90),
    Math.abs(norm - 270)
  );
  const scaleX = 0.62 + 0.38 * Math.min(1, distanceFromFlat / 35);
  const mirror = norm > 180 ? -1 : 1;

  const beginDrag = (clientX: number) => {
    setAutoRotate(false);
    dragging.current = true;
    lastX.current = clientX;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    beginDrag(e.clientX);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      // Stop the page from scrolling while the product is being rotated,
      // especially important on touch/mobile where pointer + touch events
      // can otherwise both fire.
      e.preventDefault();
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      setAngle((a) => (a - dx * 0.6 + 360) % 360);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.label}
            onClick={() => {
              setAutoRotate(false);
              setAngle(v.angle);
            }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
              (Math.round(norm / 90) * 90) % 360 === v.angle
                ? "border-brown-dark bg-brown-dark text-gold"
                : "border-line text-muted hover:border-brown-dark/40"
            }`}
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={() => setAutoRotate((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted transition-all duration-300 hover:border-brown-dark/40"
        >
          {autoRotate ? <Pause size={13} /> : <Play size={13} />}
          {autoRotate ? "Pause" : "Auto Rotate"}
        </button>
      </div>

      <div
        onPointerDown={onPointerDown}
        onTouchMove={(e) => {
          // Belt-and-suspenders: some mobile browsers need the scroll
          // block reinforced at the touch level even with touch-action:none.
          if (dragging.current) e.preventDefault();
        }}
        className="relative w-full max-w-[560px] cursor-grab touch-none select-none rounded-xl3 border border-line bg-section p-3 active:cursor-grabbing"
        style={{ perspective: "1400px", touchAction: "none" }}
      >
        <div
          style={{
            transform: `scaleX(${mirror * scaleX})`,
            transition: dragging.current ? "none" : "transform 0.18s ease-out",
            opacity: imagesReady ? 1 : 0,
          }}
          className="transition-opacity duration-300"
        >
          <DesignCanvas
            baseImage={baseImage}
            color={color}
            side={displaySide}
            layers={layers}
            selectedId={selectedId}
            onSelect={onSelect}
            onChange={onChange}
            onCommit={onCommit}
            onGestureStart={onGestureStart}
            showSafeZone={displaySide === editSide}
          />
        </div>

        {!imagesReady && (
          <div className="absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-xl2 bg-section">
            <Loader2 size={22} className="animate-spin text-brown-dark/70" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              Loading preview…
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-brown-dark/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
          <RotateCw size={11} className="mr-1.5 inline -mt-0.5" />
          {displaySide === "front" ? "Front" : "Back"} view · drag to rotate
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-line bg-white p-1.5">
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              onEditSideChange(s);
              setAutoRotate(false);
              setAngle(s === "front" ? 0 : 180);
            }}
            className={`rounded-full px-5 py-2 text-xs font-semibold capitalize transition-all duration-300 ${
              editSide === s ? "bg-brown-dark text-gold" : "text-muted hover:text-ink"
            }`}
          >
            Editing {s}
          </button>
        ))}
      </div>
    </div>
  );
}
