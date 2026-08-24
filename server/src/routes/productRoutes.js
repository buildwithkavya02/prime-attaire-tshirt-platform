import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  listPublicProducts,
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  duplicateProduct,
  deleteProduct,
} from "../controllers/productController.js";

// Public router: GET /api/products
export const publicProductRouter = Router();
publicProductRouter.get("/", listPublicProducts);

// Admin router: /api/admin/products
export const adminProductRouter = Router();
adminProductRouter.use(requireAdmin);
adminProductRouter.get("/", listAdminProducts);
adminProductRouter.get("/:id", getAdminProduct);
adminProductRouter.post("/", createProduct);
adminProductRouter.put("/:id", updateProduct);
adminProductRouter.patch("/:id/status", updateProductStatus);
adminProductRouter.post("/:id/duplicate", duplicateProduct);
adminProductRouter.delete("/:id", deleteProduct);
