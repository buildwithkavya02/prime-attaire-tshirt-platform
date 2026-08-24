import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// server/uploads/products — served statically by app.js at /uploads/products/*
export const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads", "products");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

// Single "image" field, 5MB cap, image mimetypes only — matches the
// product-card / thumbnail use case; not a general file-upload endpoint.
export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP or GIF images are allowed."));
    }
    cb(null, true);
  },
}).single("image");
