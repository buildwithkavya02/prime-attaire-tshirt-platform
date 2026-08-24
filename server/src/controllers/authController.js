import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { signAdminToken } from "../utils/token.js";
import { ok, fail } from "../utils/response.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, "Email and password are required.", 400);

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) return fail(res, "Invalid email or password.", 401);

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return fail(res, "Invalid email or password.", 401);

    const token = signAdminToken(admin);
    return ok(res, { token, admin: { name: admin.name, email: admin.email } });
  } catch (err) {
    next(err);
  }
}

// Stateless JWTs have nothing to invalidate server-side; this endpoint
// exists so the frontend has a consistent call to make when signing out.
export async function logout(_req, res) {
  return ok(res, { loggedOut: true });
}

export async function session(req, res) {
  return ok(res, { loggedIn: !!req.admin });
}
