import type { DesignLayer } from "../types";

const CANVAS_SIZE = 1000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function exportDesignPNG(
  baseImage: string,
  color: string,
  layers: DesignLayer[],
  side: "front" | "back"
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE * 1.25;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // background
  ctx.fillStyle = "#F8F5F2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = canvas.width * 0.06;
  const drawW = canvas.width - margin * 2;
  const drawH = canvas.height - margin * 2;

  const base = await loadImage(baseImage);

  // fit base image into draw area preserving aspect ratio
  const scale = Math.min(drawW / base.width, drawH / base.height);
  const w = base.width * scale;
  const h = base.height * scale;
  const x = margin + (drawW - w) / 2;
  const y = margin + (drawH - h) / 2;

  // 1. colored silhouette (clip color rect to garment alpha shape)
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(base, x, y, w, h);
  ctx.restore();

  // 2. shading multiply pass
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(base, x, y, w, h);
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";

  // 3. layers — positioned relative to the full canvas, matching the live editor
  // where layers are placed relative to the outer container, not the inset image box.
  for (const layer of layers.filter((l) => l.side === side)) {
    const cx = (layer.x / 100) * canvas.width;
    const cy = (layer.y / 100) * canvas.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "image") {
      const img = await loadImage(layer.src);
      const lw = (layer.width / 100) * canvas.width;
      const lh = (layer.height / 100) * canvas.height;
      ctx.drawImage(img, -lw / 2, -lh / 2, lw, lh);
    } else {
      const editorReferenceWidth = 520; // matches ProductViewer's max-w container
      const fontSizePx = (layer.size / editorReferenceWidth) * canvas.width;
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "700" : "500"} ${fontSizePx}px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.text, 0, 0);
    }
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
