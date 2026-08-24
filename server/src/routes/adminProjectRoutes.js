import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  setProjectStatus,
  revokeProject,
  regenerateAccessCode,
} from "../controllers/projectController.js";

const router = Router();
router.use(requireAdmin);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.post("/:id/status", setProjectStatus);
router.post("/:id/revoke", revokeProject);
router.post("/:id/private-link/regenerate", regenerateAccessCode);

export default router;
