import { Check } from "lucide-react";

interface Props {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ colors, value, onChange }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-label={`Select color ${c}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/80 shadow-sm transition-transform duration-300 hover:scale-110"
            style={{ backgroundColor: c }}
          >
            {value === c && (
              <Check
                size={16}
                className={c === "#F8F5F2" ? "text-ink" : "text-white"}
                strokeWidth={3}
              />
            )}
          </button>
        ))}
        <label className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed border-line text-[10px] font-semibold text-muted">
          +
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
