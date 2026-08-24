// import { useState } from "react";
// import { Bold, Italic, Type } from "lucide-react";

// const FONTS = ["Inter", "Georgia", "'Courier New'", "'Brush Script MT'", "Verdana"];

// interface Props {
//   onAdd: (text: string, font: string, bold: boolean, italic: boolean, color: string) => void;
// }

// export default function TextEditor({ onAdd }: Props) {
//   const [text, setText] = useState("");
//   const [font, setFont] = useState(FONTS[0]);
//   const [bold, setBold] = useState(false);
//   const [italic, setItalic] = useState(false);
//   const [color, setColor] = useState("#2F241F");

//   return (
//     <div className="space-y-3">
//       <div className="relative">
//         <Type size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Enter your text..."
//           className="w-full rounded-full border border-line bg-bg py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-gold"
//         />
//       </div>

//       <div className="flex flex-wrap items-center gap-2">
//         <select
//           value={font}
//           onChange={(e) => setFont(e.target.value)}
//           className="rounded-full border border-line bg-bg px-4 py-2.5 text-xs outline-none focus:border-gold"
//         >
//           {FONTS.map((f) => (
//             <option key={f} value={f} style={{ fontFamily: f }}>
//               {f.replace(/'/g, "")}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={() => setBold((v) => !v)}
//           className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
//             bold ? "border-brown-dark bg-brown-dark text-gold" : "border-line text-ink"
//           }`}
//         >
//           <Bold size={14} />
//         </button>
//         <button
//           onClick={() => setItalic((v) => !v)}
//           className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
//             italic ? "border-brown-dark bg-brown-dark text-gold" : "border-line text-ink"
//           }`}
//         >
//           <Italic size={14} />
//         </button>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="h-9 w-9 cursor-pointer rounded-full border border-line p-0.5"
//         />
//       </div>

//       <button
//         onClick={() => {
//           if (!text.trim()) return;
//           onAdd(text, font, bold, italic, color);
//           setText("");
//         }}
//         className="w-full rounded-full bg-brown-dark py-3 text-sm font-semibold text-bg transition-transform duration-300 hover:scale-[1.01] disabled:opacity-40"
//         disabled={!text.trim()}
//       >
//         Add Text
//       </button>
//     </div>
//   );
// }




import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bold, Italic, Type, ChevronDown, Minus, Plus, Check, Palette } from "lucide-react";
import { TEXT_COLORS } from "../../data/ProductColors";

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Brush Script", value: "'Brush Script MT', cursive" },
];

const MIN_SIZE = 10;
const MAX_SIZE = 160;
const STEP = 4;

interface Props {
  onAdd: (
    text: string,
    font: string,
    fontSize: number,
    bold: boolean,
    italic: boolean,
    color: string
  ) => void;
}

export default function TextEditor({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0].value);
  const [fontOpen, setFontOpen] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [color, setColor] = useState(TEXT_COLORS[0].hex);
  const [customOpen, setCustomOpen] = useState(false);

  const selectedFont = FONTS.find((f) => f.value === font) ?? FONTS[0];

  const adjustSize = (delta: number) =>
    setFontSize((v) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, v + delta)));

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text, font, fontSize, bold, italic, color);
    setText("");
  };

  return (
    <div className="space-y-4">
      {/* Text input */}
      <div className="relative">
        <Type size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text..."
          className="w-full rounded-full border border-line bg-bg py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-gold"
        />
      </div>

      {/* Font dropdown */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Font</label>
        <div className="relative mt-1.5">
          <button
            type="button"
            onClick={() => setFontOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          >
            <span style={{ fontFamily: selectedFont.value }}>{selectedFont.name}</span>
            <ChevronDown size={14} className={`text-muted transition-transform ${fontOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {fontOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"
              >
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setFont(f.value);
                      setFontOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-base transition-colors ${
                      font === f.value ? "bg-gold/10 text-brown-dark" : "text-ink hover:bg-bg"
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.name}
                    {font === f.value && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Style + size */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Style</label>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBold((v) => !v)}
              aria-label="Toggle bold"
              aria-pressed={bold}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
                bold ? "border-brown-dark bg-brown-dark text-gold" : "border-line text-ink hover:border-brown-dark/40"
              }`}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => setItalic((v) => !v)}
              aria-label="Toggle italic"
              aria-pressed={italic}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
                italic ? "border-brown-dark bg-brown-dark text-gold" : "border-line text-ink hover:border-brown-dark/40"
              }`}
            >
              <Italic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Font Size</label>
          <div className="mt-1.5 flex items-center gap-1 rounded-full border border-line bg-bg px-1.5 py-1">
            <button
              type="button"
              onClick={() => adjustSize(-STEP)}
              aria-label="Decrease font size"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-white disabled:opacity-30"
              disabled={fontSize <= MIN_SIZE}
            >
              <Minus size={13} />
            </button>
            <span className="w-14 text-center text-xs font-medium text-ink">{fontSize}px</span>
            <button
              type="button"
              onClick={() => adjustSize(STEP)}
              aria-label="Increase font size"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-white disabled:opacity-30"
              disabled={fontSize >= MAX_SIZE}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Text color */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Text Color</label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {TEXT_COLORS.map((c) => {
            const isSelected = c.hex.toLowerCase() === color.toLowerCase();
            const light = c.hex.toLowerCase() === "#ffffff";
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  setColor(c.hex);
                  setCustomOpen(false);
                }}
                aria-label={`Select ${c.name} text color`}
                aria-pressed={isSelected}
                title={c.name}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                  isSelected ? "ring-2 ring-gold ring-offset-2" : "ring-1 ring-line hover:ring-brown-dark/40"
                } ${light ? "border border-line" : ""}`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && <Check size={12} strokeWidth={3} className={light ? "text-brown-dark" : "text-white"} />}
              </button>
            );
          })}

          {/* Optional custom color escape hatch — not part of the predefined
             palette, but useful for one-off requests. Kept visually distinct
             (dashed ring + icon) so it never looks like a "default" choice. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCustomOpen((v) => !v)}
              aria-label="Choose a custom text color"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-line text-muted transition-colors hover:border-brown-dark/40 hover:text-ink"
              title="Custom color"
            >
              <Palette size={13} />
            </button>
            {customOpen && (
              <input
                type="color"
                autoFocus
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onBlur={() => setCustomOpen(false)}
                className="absolute left-0 top-10 z-20 h-9 w-9 cursor-pointer rounded-full border border-line p-0.5"
              />
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="w-full rounded-full bg-brown-dark py-3 text-sm font-semibold text-bg transition-transform duration-300 hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
      >
        Add Text
      </button>
    </div>
  );
}
