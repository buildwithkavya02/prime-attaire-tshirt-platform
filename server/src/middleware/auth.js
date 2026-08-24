import { verifyAdminToken } from "../utils/token.js";
import { fail } from "../utils/response.js";

/** Requires a valid admin JWT in the Authorization header. */
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "Authentication required.", 401);

  try {
    const payload = verifyAdminToken(token);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return fail(res, "Invalid or expired session. Please log in again.", 401);
  }
}

/** Verifies a JWT if present, but doesn't reject the request otherwise. */
export function optionalAdmin(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = verifyAdminToken(token);
      req.admin = { id: payload.sub, email: payload.email };
    } catch {
      // ignore invalid token — treated as logged out
    }
  }
  next();
}
