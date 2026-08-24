import type { DesignLayer, DesignTextLayer } from "../types";
import { getColorLabel } from "../data/ProductColors";

interface BuildWhatsAppMessageArgs {
  customerName: string;
  productName: string;
  color: string;
  layers: DesignLayer[];
}

const isTextLayer = (layer: DesignLayer): layer is DesignTextLayer => layer.type === "text";

const sideLabel = (side: "front" | "back") => (side === "front" ? "Front" : "Back");

export const buildWhatsAppMessage = ({
  customerName,
  productName,
  color,
  layers,
}: BuildWhatsAppMessageArgs): string => {
  const textLayers = layers.filter(isTextLayer);
  const imageLayers = layers.filter((l) => l.type === "image");
  const frontImages = imageLayers.filter((l) => l.side === "front").length;
  const backImages = imageLayers.filter((l) => l.side === "back").length;

  const lines: string[] = [
    "Hello, I have completed my custom T-Shirt design.",
    "Please review my design and provide pricing details.",
    "",
    `Customer Name: ${customerName}`,
    "",
    `Selected Product: ${productName}`,
    "",
    `Product Color: ${getColorLabel(color)}`,
    "",
  ];

  if (textLayers.length === 0) {
    lines.push("Custom Text: —");
  } else {
    lines.push("Custom Text:");
    textLayers.forEach((t, i) => {
      lines.push(
        `${i + 1}. "${t.text}"`,
        `   Side: ${sideLabel(t.side)}`,
        `   Font: ${t.font.replace(/'/g, "").split(",")[0]}`,
        `   Size: ${t.size}px`,
        `   Style: ${t.bold ? "Bold" : "Regular"}`,
        `   Italic: ${t.italic ? "Yes" : "No"}`,
        `   Color: ${getColorLabel(t.color)}`
      );
    });
  }

  lines.push(
    "",
    `Uploaded Design Layers: ${imageLayers.length}`,
    `Front Designs: ${frontImages}`,
    `Back Designs: ${backImages}`,
    "",
    "Preview image downloaded separately and will be attached here."
  );

  return lines.join("\n");
};