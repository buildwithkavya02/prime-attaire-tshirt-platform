export type ProductSlug =
  | "round-neck"
  | "sleeveless"
  | "polo"
  | "hoodie"
  | "full-sleeve"
  | "v-neck";

export interface Product {
  slug: ProductSlug | string;
  name: string;
  description: string;
  basePrice: number;
  front: string;
  back: string;
  colors: string[];

  // Present on products that came from the live API (the storefront's
  // real source of truth); absent on the small static fallback catalog in
  // `src/data/products.ts`. Kept optional so both shapes satisfy this
  // interface without duplicating a second product type.
  id?: string;
  type?: ProductSlug | string; // category/product type, e.g. "hoodie"
  thumbnail?: string;
  originalPrice?: number;
  status?: "draft" | "active" | "inactive";
  featured?: boolean;
  stock?: number;
  sizes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ViewAngle = "front" | "right" | "back" | "left";

export interface DesignImageLayer {
  id: string;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  side: "front" | "back";
}

export interface DesignTextLayer {
  id: string;
  type: "text";
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;
  x: number;
  y: number;
  rotation: number;
  side: "front" | "back";
}

export type DesignLayer = DesignImageLayer | DesignTextLayer;

export interface DesignState {
  productSlug: ProductSlug;
  productColor: string;
  layers: DesignLayer[];
}
