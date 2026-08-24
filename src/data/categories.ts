import { PRODUCT_TYPES, type ProductType } from "../types/admin";

export type ProductCategory = "all" | ProductType;

// Single source of truth for category labels — used by the admin product
// form, the customer Products page filter bar, and product cards, so
// "Round Neck" / "round neck" / "ROUND NECK" can never drift into separate
// categories (the underlying value is always the lowercase-hyphen type).
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: "All",
  "round-neck": "Round Neck",
  "v-neck": "V-Neck",
  polo: "Polo",
  hoodie: "Hoodie",
  sleeveless: "Sleeveless",
  "full-sleeve": "Full Sleeve",
};

export const PRODUCT_CATEGORIES: ProductCategory[] = ["all", ...PRODUCT_TYPES];

export function categoryLabel(value?: string | null): string {
  if (!value) return "Uncategorized";
  return CATEGORY_LABELS[value as ProductCategory] ?? value;
}
