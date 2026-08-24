import { useRef } from "react";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  side: "front" | "back";
  onUpload: (dataUrl: string) => void;
}

export default function UploadPanel({ side, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      toast.error("Please upload a PNG, JPG, WEBP or SVG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onUpload(reader.result as string);
      toast.success(`Artwork added to ${side}`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-line bg-bg px-4 py-8 text-center transition-colors duration-300 hover:border-gold hover:bg-section/50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-section text-brown-dark">
        <UploadCloud size={18} />
      </span>
      <p className="text-sm font-semibold text-ink">Upload {side} design</p>
      <p className="text-xs text-muted">PNG, JPG, WEBP, SVG — up to 10MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
