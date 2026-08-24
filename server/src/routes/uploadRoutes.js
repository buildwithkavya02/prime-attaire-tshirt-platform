import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { uploadProductImage } from "../middleware/upload.js";
import { fail, ok } from "../utils/response.js";

const router = Router();
router.use(requireAdmin);

// POST /api/admin/uploads/product-image  (multipart/form-data, field: "image")
router.post("/product-image", (req, res) => {
  uploadProductImage(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5MB." : err.message;
      return fail(res, message || "Upload failed.", 400);
    }
    if (!req.file) return fail(res, "No image file provided.", 400);

    const url = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    return ok(res, { url, filename: req.file.filename }, 201);
  });
});

export default router;
