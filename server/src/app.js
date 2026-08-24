import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import adminProjectRoutes from "./routes/adminProjectRoutes.js";
import privateRoutes from "./routes/privateRoutes.js";
import adminDesignRoutes from "./routes/adminDesignRoutes.js";
import { publicProductRouter, adminProductRouter } from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Comma-separated CLIENT_URL supports multiple allowed origins (e.g. a
  // local dev URL and a deployed one) without pulling in anything heavier.
  const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  // Generous body limit — design payloads include base64-embedded artwork.
  app.use(express.json({ limit: "15mb" }));

  // Uploaded product images — publicly readable (product cards/thumbnails
  // need to load them without an admin session), written only via the
  // admin-guarded /api/admin/uploads route.
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

  app.use("/api/admin", authRoutes);
  app.use("/api/admin/projects", adminProjectRoutes);
  app.use("/api/admin/designs", adminDesignRoutes);
  app.use("/api/admin/products", adminProductRouter);
  app.use("/api/admin/uploads", uploadRoutes);
  app.use("/api/admin/dashboard", dashboardRoutes);

  app.use("/api/products", publicProductRouter);
  app.use("/api", privateRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
