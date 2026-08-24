import { Router } from "express";
import { privateLinkLimiter } from "../middleware/rateLimiter.js";
import {
  validatePrivateLink,
  requireValidPrivateToken,
} from "../controllers/privateLinkController.js";
import {
  getDesignForToken,
  saveDraftDesign,
  submitDesign,
} from "../controllers/designController.js";

const router = Router();

// POST /api/private-links/validate
router.post("/private-links/validate", privateLinkLimiter, validatePrivateLink);

// /api/private-projects/:token/design*
router.get(
  "/private-projects/:token/design",
  privateLinkLimiter,
  requireValidPrivateToken,
  getDesignForToken
);
router.post(
  "/private-projects/:token/design",
  privateLinkLimiter,
  requireValidPrivateToken,
  saveDraftDesign
);
router.post(
  "/private-projects/:token/design/submit",
  privateLinkLimiter,
  requireValidPrivateToken,
  submitDesign
);

export default router;
