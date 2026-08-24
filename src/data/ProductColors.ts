export interface ProductColor {
  name: string;
  hex: string;
  /** Optional texture/product photo for a swatch, if you have real garment shots. */
  image?: string;
}

/**
 * Predefined T-shirt colors, sourced from the studio's official color
 * reference sheet (the two-row palette image). Customers can only pick
 * from this list — no native color picker.
 *
 * If you later want per-product color availability (e.g. the Hoodie only
 * comes in 4 of these), swap this flat array for a lookup keyed by
 * product.slug — the ColorSelector component already accepts a `colors`
 * prop so that's a drop-in change, no UI work needed.
 */
export const PRODUCT_COLORS: ProductColor[] = [
  { name: "Espresso Brown", hex: "#4C2D23" },
  { name: "Forest Green", hex: "#388C63" },
  { name: "Royal Blue", hex: "#0C5FCE" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Signal Red", hex: "#D71E14" },
  { name: "Navy", hex: "#183761" },
  { name: "Dusty Rose", hex: "#DED3D3" },
];

/**
 * Print-friendly palette for text/artwork color. Deliberately smaller and
 * higher-contrast than the garment palette — these are the colors that
 * read well on fabric.
 */
export const TEXT_COLORS: ProductColor[] = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Brown", hex: "#2F241F" },
  { name: "Gold", hex: "#C8A165" },
  { name: "Signal Red", hex: "#D71E14" },
  { name: "Forest Green", hex: "#388C63" },
  { name: "Navy", hex: "#183761" },
];

const ALL_NAMED_COLORS = [...PRODUCT_COLORS, ...TEXT_COLORS];
const normalize = (hex: string) => hex.trim().toLowerCase();
const COLOR_LOOKUP = new Map(ALL_NAMED_COLORS.map((c) => [normalize(c.hex), c.name]));

/** "Cream" / "Custom" if the hex isn't in either predefined palette. */
export const getColorName = (hex: string): string => COLOR_LOOKUP.get(normalize(hex)) ?? "Custom";

/** "Cream (#F8F5F2)" — used everywhere a human-readable color needs to show up. */
export const getColorLabel = (hex: string): string => `${getColorName(hex)} (${hex.toUpperCase()})`;