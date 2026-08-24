import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  listDesigns,
  getDesignById,
  approveDesign,
  rejectDesign,
  requestRevision,
} from "../controllers/designController.js";

const router = Router();
router.use(requireAdmin);

router.get("/", listDesigns);
router.get("/:id", getDesignById);
router.post("/:id/approve", approveDesign);
router.post("/:id/reject", rejectDesign);
router.post("/:id/revision", requestRevision);

export default router;
