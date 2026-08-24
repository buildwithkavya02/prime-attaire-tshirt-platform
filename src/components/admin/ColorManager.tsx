import { Check } from "lucide-react";
import { PRODUCT_COLORS } from "../../data/ProductColors";
import type { AdminProductColor } from "../../types/admin";

interface ColorManagerProps {
  colors: AdminProductColor[];
  onChange: (colors: AdminProductColor[]) => void;
}

const isLightSwatch = (hex: string) => {
  const light = ["#ffffff", "#ded3d3"];
  return light.includes(hex.toLowerCase());
};

/**
 * Admin color selection is deliberately restricted to the studio's fixed
 * 8-color palette (PRODUCT_COLORS — the single source of truth reused by
 * the customer-facing color pickers). Admins can only toggle which of
 * these predefined colors are available for a product; arbitrary hex entry
 * is intentionally not offered, to keep the catalog visually consistent.
 */
export default function ColorManager({ colors, onChange }: ColorManagerProps) {
  const isSelected = (hex: string) =>
    colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase());

  const toggleColor = (name: string, hex: string) => {
    if (isSelected(hex)) {
      onChange(colors.filter((c) => c.hex.toLowerCase() !== hex.toLowerCase()));
    } else {
      onChange([...colors, { name, hex, active: true }]);
    }
  };

  return (
    <div>
      <p className="text-xs text-muted">
        Select which of the studio's standard colors are available for this product.
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        {PRODUCT_COLORS.map((c) => {
          const selected = isSelected(c.hex);
          const light = isLightSwatch(c.hex);
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => toggleColor(c.name, c.hex)}
              aria-pressed={selected}
              title={c.name}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                  selected
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-white scale-105"
                    : "ring-1 ring-line hover:ring-brown-dark/40"
                } ${light ? "border border-line" : ""}`}
                style={{ backgroundColor: c.hex }}
              >
                {selected && (
                  <Check size={14} strokeWidth={3} className={light ? "text-brown-dark" : "text-white"} />
                )}
              </span>
              <span className="text-[10px] tracking-wide text-muted">{c.name}</span>
            </button>
          );
        })}
      </div>

      {colors.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          No colors selected yet. Select at least one color option above.
        </p>
      )}
    </div>
  );
}
