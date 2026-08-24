import { Check } from "lucide-react";
import { PRODUCT_COLORS, getColorName, type ProductColor } from "../../data/ProductColors";

interface ColorSelectorProps {
  value: string;
  onChange: (hex: string) => void;
  colors?: ProductColor[];
}

const isLightSwatch = (hex: string) => {
  const light = ["#ffffff", "#ded3d3", "#f8f5f2"];
  return light.includes(hex.toLowerCase());
};

export default function ColorSelector({ value, onChange, colors = PRODUCT_COLORS }: ColorSelectorProps) {
  const selectedName = getColorName(value);

  return (
    <div>
      <p className="text-xs text-muted">Choose your preferred T-shirt color</p>

      <div className="mt-4 flex flex-wrap gap-4">
        {colors.map((c) => {
          const isSelected = c.hex.toLowerCase() === value.toLowerCase();
          const light = isLightSwatch(c.hex);

          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange(c.hex)}
              aria-label={`Select ${c.name} color`}
              aria-pressed={isSelected}
              title={c.name}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-white scale-105"
                    : "ring-1 ring-line hover:ring-brown-dark/40"
                } ${light ? "border border-line" : ""}`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check size={14} strokeWidth={3} className={light ? "text-brown-dark" : "text-white"} />
                )}
              </span>
              <span className="text-[10px] tracking-wide text-muted">{c.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-line bg-bg px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Selected Color</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {selectedName} <span className="font-normal text-muted">{value.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
}
