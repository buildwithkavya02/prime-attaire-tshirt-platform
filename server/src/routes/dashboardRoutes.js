import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = Router();
router.get("/", requireAdmin, getDashboardStats);

export default router;
