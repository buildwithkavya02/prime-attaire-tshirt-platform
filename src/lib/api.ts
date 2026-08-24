/**
 * ------------------------------------------------------------------------
 * API LAYER
 *
 * Every function here is async and returns plain data — exactly the same
 * shapes the previous localStorage-backed mock returned, so every page
 * that already calls through this file needed no changes except for the
 * three design functions below, which now take the private-link `token`
 * instead of `projectId` (the backend derives the project from the
 * validated token rather than trusting a client-supplied id — see
 * server/README.md, "Design decisions" #4).
 * ------------------------------------------------------------------------
 */
import type {
  AdminProduct,
  AdminProductInput,
  CreateProjectInput,
  Design,
  DesignStatus,
  Project,
  ProductListParams,
  ProductStatus,
  StudioSettings,
  TokenValidationResult,
} from "../types/admin";
import type { DesignLayer, Product } from "../types";
import { http, unwrap, authToken } from "./httpClient";

/* ------------------------------------------------------------------ */
/*  Admin auth                                                         */
/* ------------------------------------------------------------------ */

export async function adminLogin(email: string, password: string) {
  try {
    const { token } = await unwrap<{ token: string; admin: { name: string; email: string } }>(
      http.post("/admin/login", { email, password })
    );
    authToken.set(token);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function adminLogout() {
  authToken.clear();
  return { ok: true };
}

export async function getAdminSession() {
  if (!authToken.get()) return { loggedIn: false };
  try {
    const result = await unwrap<{ loggedIn: boolean }>(http.get("/admin/session"));
    if (!result.loggedIn) authToken.clear();
    return result;
  } catch {
    authToken.clear();
    return { loggedIn: false };
  }
}

/* ------------------------------------------------------------------ */
/*  Customer-facing: token validation & access                         */
/* ------------------------------------------------------------------ */

export async function validateDesignToken(token: string): Promise<TokenValidationResult> {
  return unwrap<TokenValidationResult>(http.post("/private-links/validate", { token }));
}

export async function verifyAccessCode(
  token: string,
  code: string
): Promise<TokenValidationResult> {
  return unwrap<TokenValidationResult>(
    http.post("/private-links/validate", { token, accessCode: code })
  );
}

/* ------------------------------------------------------------------ */
/*  Customer-facing: designs — identified by the private link token,   */
/*  never by projectId (the server re-validates the token every time)  */
/* ------------------------------------------------------------------ */

export async function getDesignForProject(token: string): Promise<Design> {
  return unwrap<Design>(http.get(`/private-projects/${token}/design`));
}

export async function saveDraftDesign(
  token: string,
  color: string,
  layers: DesignLayer[],
  previewDataUrl: string | null
): Promise<Design> {
  return unwrap<Design>(
    http.post(`/private-projects/${token}/design`, { color, layers, previewDataUrl })
  );
}

export async function submitDesign(
  token: string,
  color: string,
  layers: DesignLayer[],
  previewDataUrl: string | null
): Promise<Design> {
  return unwrap<Design>(
    http.post(`/private-projects/${token}/design/submit`, { color, layers, previewDataUrl })
  );
}

/* ------------------------------------------------------------------ */
/*  Admin: projects                                                     */
/* ------------------------------------------------------------------ */

export async function listProjects(): Promise<Project[]> {
  return unwrap<Project[]>(http.get("/admin/projects"));
}

export async function getProject(id: string): Promise<Project | null> {
  return unwrap<Project | null>(http.get(`/admin/projects/${id}`));
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return unwrap<Project>(http.post("/admin/projects", input));
}

export async function updateProject(
  id: string,
  patch: Partial<CreateProjectInput>
): Promise<Project | null> {
  return unwrap<Project | null>(http.put(`/admin/projects/${id}`, patch));
}

export async function setProjectStatus(
  id: string,
  status: "active" | "disabled"
): Promise<Project | null> {
  return unwrap<Project | null>(http.post(`/admin/projects/${id}/status`, { status }));
}

export async function revokeProject(id: string, revoked: boolean): Promise<Project | null> {
  return unwrap<Project | null>(http.post(`/admin/projects/${id}/revoke`, { revoked }));
}

export async function regenerateAccessCode(id: string): Promise<Project | null> {
  return unwrap<Project | null>(http.post(`/admin/projects/${id}/private-link/regenerate`));
}

/* ------------------------------------------------------------------ */
/*  Admin: designs                                                      */
/* ------------------------------------------------------------------ */

export async function listDesigns(): Promise<(Design & { project?: Project })[]> {
  return unwrap<(Design & { project?: Project })[]>(http.get("/admin/designs"));
}

export async function getDesign(id: string): Promise<(Design & { project?: Project }) | null> {
  return unwrap<(Design & { project?: Project }) | null>(http.get(`/admin/designs/${id}`));
}

export async function updateDesignStatus(
  id: string,
  status: DesignStatus,
  feedback?: string | null
): Promise<Design | null> {
  if (status === "APPROVED") {
    return unwrap<Design | null>(http.post(`/admin/designs/${id}/approve`));
  }
  if (status === "REJECTED") {
    return unwrap<Design | null>(http.post(`/admin/designs/${id}/reject`));
  }
  return unwrap<Design | null>(http.post(`/admin/designs/${id}/revision`, { feedback }));
}

/* ------------------------------------------------------------------ */
/*  Admin: products                                                     */
/* ------------------------------------------------------------------ */

export async function listProducts(params?: ProductListParams): Promise<AdminProduct[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  if (params?.sort) query.set("sort", params.sort);
  const qs = query.toString();
  return unwrap<AdminProduct[]>(http.get(`/admin/products${qs ? `?${qs}` : ""}`));
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  return unwrap<AdminProduct | null>(http.get(`/admin/products/${id}`));
}

export async function updateProduct(
  id: string,
  patch: Partial<AdminProductInput>
): Promise<AdminProduct | null> {
  return unwrap<AdminProduct | null>(http.put(`/admin/products/${id}`, patch));
}

export async function createProduct(input: Partial<AdminProductInput>): Promise<AdminProduct> {
  return unwrap<AdminProduct>(http.post("/admin/products", input));
}

export async function deleteProduct(id: string): Promise<{ deleted: boolean }> {
  return unwrap<{ deleted: boolean }>(http.delete(`/admin/products/${id}`));
}

export async function setProductStatus(
  id: string,
  status: ProductStatus
): Promise<AdminProduct | null> {
  return unwrap<AdminProduct | null>(http.patch(`/admin/products/${id}/status`, { status }));
}

export async function duplicateProduct(id: string): Promise<AdminProduct> {
  return unwrap<AdminProduct>(http.post(`/admin/products/${id}/duplicate`, {}));
}

/**
 * Uploads a product image file and returns the URL to store on the product
 * record (thumbnail/front/back/etc). The backend saves it to disk and
 * serves it statically — see server/src/routes/uploadRoutes.js.
 */
export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);
  return unwrap<{ url: string; filename: string }>(
    http.post("/admin/uploads/product-image", formData)
  );
}

/* ------------------------------------------------------------------ */
/*  Public: storefront products                                        */
/* ------------------------------------------------------------------ */

export async function getPublicProducts(): Promise<Product[]> {
  return unwrap<Product[]>(http.get("/products"));
}

/* ------------------------------------------------------------------ */
/*  Admin: settings                                                     */
/* ------------------------------------------------------------------ */
/*
 * Not part of the minimal-backend spec — StudioSettings (WhatsApp number,
 * default expiry, business name, logo, default message) has no dedicated
 * collection or endpoint on the backend. Keeping it in localStorage here
 * matches the spec's instruction not to over-build: it's a handful of
 * business-config values with a single admin, not data that needs to be
 * shared, audited, or survive a server migration. If that changes, this
 * is the only place to swap for a real `/api/admin/settings` endpoint.
 */
const SETTINGS_KEY = "pa_admin_settings";

const DEFAULT_SETTINGS: StudioSettings = {
  whatsappNumber: "9962605619",
  defaultExpiryDays: 30,
  businessName: "Prime Attaire",
  logoUrl: "/images/favicon.jpeg",
  defaultCustomerMessage:
    "Hello! Your private design project is ready. Please use the link and access code below to start customizing.",
};

export async function getSettings(): Promise<StudioSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as StudioSettings) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: StudioSettings): Promise<StudioSettings> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

/* ------------------------------------------------------------------ */
/*  Admin: dashboard stats                                              */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  activeProjects: number;
  pendingDesigns: number;
  approvedDesigns: number;
  activeLinks: number;
  recentProjects: Project[];
  recentDesigns: (Design & { project?: Project })[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return unwrap<DashboardStats>(http.get("/admin/dashboard"));
}
