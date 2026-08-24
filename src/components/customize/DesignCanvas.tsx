import { useCallback, useRef } from "react";
import { RotateCw as RotateIcon } from "lucide-react";
import type { DesignLayer } from "../../types";

interface Props {
  baseImage: string;
  color: string;
  side: "front" | "back";
  layers: DesignLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<DesignLayer>) => void;
  onCommit: () => void;
  onGestureStart: () => void;
  showSafeZone?: boolean;
}

export default function DesignCanvas({
  baseImage,
  color,
  side,
  layers,
  selectedId,
  onSelect,
  onChange,
  onCommit,
  onGestureStart,
  showSafeZone = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getRect = useCallback(() => containerRef.current?.getBoundingClientRect(), []);

  const startDrag = (layer: DesignLayer, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(layer.id);
    onGestureStart();
    const rect = getRect();
    if (!rect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = layer.x;
    const originY = layer.y;

    const move = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startY) / rect.height) * 100;
      onChange(layer.id, {
        x: Math.min(100, Math.max(0, originX + dxPct)),
        y: Math.min(100, Math.max(0, originY + dyPct)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (layer: DesignLayer, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onGestureStart();
    const rect = getRect();
    if (!rect) return;
    const startX = e.clientX;
    const startDim = layer.type === "image" ? layer.width : layer.size;

    const move = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      if (layer.type === "image") {
        const newWidth = Math.min(80, Math.max(6, startDim + dxPct));
        const ratio = layer.height / layer.width;
        onChange(layer.id, { width: newWidth, height: newWidth * ratio });
      } else {
        const newSize = Math.min(160, Math.max(10, startDim + dxPct * 1.6));
        onChange(layer.id, { size: newSize });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startRotate = (layer: DesignLayer, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onGestureStart();
    const rect = getRect();
    if (!rect) return;

    const move = (ev: PointerEvent) => {
      const cx = rect.left + (rect.width * layer.x) / 100;
      const cy = rect.top + (rect.height * layer.y) / 100;
      const angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      onChange(layer.id, { rotation: Math.round(angle) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const visibleLayers = layers.filter((l) => l.side === side);

  return (
    <div
      ref={containerRef}
      onPointerDown={() => onSelect(null)}
      className="relative mx-auto aspect-[4/5] w-full max-w-[520px] select-none overflow-hidden rounded-xl2 bg-bg"
    >
      {/* colored silhouette via mask */}
      <div
        className="absolute inset-6 transition-colors duration-500"
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url(${baseImage})`,
          maskImage: `url(${baseImage})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      {/* shading overlay */}
      <img
        src={baseImage}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)] object-contain mix-blend-multiply"
      />

      {showSafeZone && (
        <div className="pointer-events-none absolute left-1/2 top-[26%] h-[38%] w-[42%] -translate-x-1/2 rounded-md border-2 border-dashed border-brown/40" />
      )}

      {visibleLayers.map((layer) => {
        const isSelected = selectedId === layer.id;
        return (
          <div
            key={layer.id}
            onPointerDown={(e) => startDrag(layer, e)}
            className={`absolute cursor-move touch-none ${
              isSelected ? "outline outline-2 outline-gold outline-offset-4" : ""
            }`}
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
              width: layer.type === "image" ? `${layer.width}%` : "auto",
              height: layer.type === "image" ? `${layer.height}%` : "auto",
            }}
          >
            {layer.type === "image" ? (
              <img
                src={layer.src}
                alt="design"
                draggable={false}
                className="h-full w-full object-contain"
              />
            ) : (
              <span
                style={{
                  fontSize: `${layer.size}px`,
                  color: layer.color,
                  fontWeight: layer.bold ? 700 : 500,
                  fontStyle: layer.italic ? "italic" : "normal",
                  fontFamily: layer.font,
                  whiteSpace: "nowrap",
                }}
              >
                {layer.text}
              </span>
            )}

            {isSelected && (
              <>
                <button
                  onPointerDown={(e) => startRotate(layer, e)}
                  className="absolute -top-9 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-brown-dark text-gold shadow-soft"
                  aria-label="Rotate"
                >
                  <RotateIcon size={13} />
                </button>
                <button
                  onPointerDown={(e) => startResize(layer, e)}
                  className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-bg bg-gold shadow-soft"
                  aria-label="Resize"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
