import { Router } from "express";
import { login, logout, session } from "../controllers/authController.js";
import { optionalAdmin } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", optionalAdmin, logout);
router.get("/session", optionalAdmin, session);

export default router;
