import type { AdminProductCustomization } from "../../types/admin";

const OPTIONS: { key: keyof AdminProductCustomization; label: string }[] = [
  { key: "front", label: "Front Design" },
  { key: "back", label: "Back Design" },
  { key: "uploadImage", label: "Upload Image" },
  { key: "text", label: "Add Text" },
  { key: "color", label: "Change Product Color" },
  { key: "font", label: "Font Selection" },
  { key: "deleteDesign", label: "Delete Design" },
  { key: "multipleDesigns", label: "Multiple Designs" },
];

interface CustomizationSettingsPanelProps {
  value: AdminProductCustomization;
  onChange: (value: AdminProductCustomization) => void;
}

export default function CustomizationSettingsPanel({
  value,
  onChange,
}: CustomizationSettingsPanelProps) {
  const toggle = (key: keyof AdminProductCustomization) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {OPTIONS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm text-ink hover:border-brown-dark/30"
        >
          <input
            type="checkbox"
            checked={Boolean(value[key])}
            onChange={() => toggle(key)}
            className="h-4 w-4 rounded border-line accent-brown-dark"
          />
          {label}
        </label>
      ))}
    </div>
  );
}
