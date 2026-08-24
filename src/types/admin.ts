import type { DesignLayer, ProductSlug } from "./index";

/* ------------------------------------------------------------------ */
/*  Products (admin-managed subset)                                    */
/* ------------------------------------------------------------------ */

export type ProductType = "round-neck" | "v-neck" | "polo" | "sleeveless" | "hoodie" | "full-sleeve";
export type ProductStatus = "draft" | "active" | "inactive";
export const PRODUCT_TYPES: ProductType[] = [
  "round-neck",
  "v-neck",
  "polo",
  "sleeveless",
  "hoodie",
  "full-sleeve",
];
export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export interface AdminProductColor {
  id?: string;
  name: string;
  hex: string;
  image?: string;
  active?: boolean;
}

export interface AdminProductCustomization {
  front: boolean;
  back: boolean;
  uploadImage: boolean;
  text: boolean;
  color: boolean;
  font: boolean;
  deleteDesign: boolean;
  multipleDesigns: boolean;
}

export interface AdminProduct {
  id: string;
  slug: ProductSlug | string;
  name: string;
  type: ProductType;
  description: string;
  basePrice: number;
  status: ProductStatus;
  active: boolean;
  thumbnail: string;
  front: string;
  back: string;
  previewImage: string;
  images360: string[];
  colorPalette: AdminProductColor[];
  colors: string[]; // hex values, derived from colorPalette
  customization: AdminProductCustomization;
  sizes: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  search?: string;
  status?: ProductStatus | "all";
  type?: ProductType | "all";
  sort?: "newest" | "oldest" | "name-asc" | "name-desc" | "price-asc" | "price-desc";
}

export type AdminProductInput = Omit<
  AdminProduct,
  "id" | "createdAt" | "updatedAt" | "active" | "colors"
>;

/* ------------------------------------------------------------------ */
/*  Projects & private links                                           */
/* ------------------------------------------------------------------ */

export type ProjectStatus = "active" | "disabled";

export interface Project {
  id: string;
  token: string; // used in /design/:token
  customerName: string;
  customerPhone: string;
  projectName: string;
  productSlug: string;
  allowedColors: string[]; // hex values, subset of product colors
  expiryDate: string | null; // ISO date, null = no expiry
  accessCodeRequired: boolean;
  accessCode: string | null;
  notes: string;
  status: ProjectStatus; // active/disabled set by admin ("revoked" reuses disabled)
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  customerName: string;
  customerPhone: string;
  projectName: string;
  productSlug: string;
  allowedColors: string[];
  expiryDate: string | null;
  accessCodeRequired: boolean;
  notes: string;
}

/* ------------------------------------------------------------------ */
/*  Designs (customer submissions tied to a project)                   */
/* ------------------------------------------------------------------ */

export type DesignStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

export interface Design {
  id: string;
  projectId: string;
  color: string;
  layers: DesignLayer[];
  status: DesignStatus;
  adminFeedback: string | null;
  previewDataUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Settings                                                            */
/* ------------------------------------------------------------------ */

export interface StudioSettings {
  whatsappNumber: string;
  defaultExpiryDays: number;
  businessName: string;
  logoUrl: string;
  defaultCustomerMessage: string;
}

/* ------------------------------------------------------------------ */
/*  Token validation (customer-facing)                                 */
/* ------------------------------------------------------------------ */

export type TokenValidationResult =
  | { status: "ok"; project: Project }
  | { status: "needs_code"; projectName: string }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "revoked" };

/* ------------------------------------------------------------------ */
/*  Admin auth                                                          */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  email: string;
}
