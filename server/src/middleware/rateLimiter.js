import rateLimit from "express-rate-limit";

// Basic brute-force protection only — per spec §19, nothing more elaborate
// is needed for this budget. Both admin login and private-link/access-code
// validation are guessable-credential surfaces, so both get limited.

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

export const privateLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please wait a few minutes and try again.",
  },
});
