import Project from "../models/Project.js";
import { ok } from "../utils/response.js";

/**
 * Returns only what the customer customization page needs — never admin
 * info, internal notes, DB internals beyond a usable id, or the access
 * code (per spec §6/§7). The token is echoed back, but that's not new
 * information: the customer already had it, it's in the URL they opened.
 */
function toCustomerProject(p) {
  return {
    id: p._id.toString(),
    token: p.token,
    projectName: p.projectName,
    customerName: p.customerName,
    productSlug: p.productSlug,
    allowedColors: p.allowedColors,
    expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
    accessCodeRequired: p.accessCodeRequired,
    status: p.status,
    revoked: p.revoked,
  };
}

async function resolve(token, code) {
  const project = await Project.findOne({ token });
  if (!project) return { status: "invalid" };
  if (project.revoked || project.status === "disabled") return { status: "revoked" };
  if (project.expiryDate && project.expiryDate.getTime() < Date.now()) {
    return { status: "expired" };
  }
  if (project.accessCodeRequired) {
    if (code === undefined || code === null) {
      return { status: "needs_code", projectName: project.projectName };
    }
    if (String(code).trim() !== project.accessCode) {
      return { status: "needs_code", projectName: project.projectName };
    }
  }
  return { status: "ok", project: toCustomerProject(project) };
}

// POST /api/private-links/validate  { token, accessCode? }
// Used both for the initial token check and for verifying an access code —
// the frontend calls it once without a code, then again once the customer
// types one in, per spec §6.
export async function validatePrivateLink(req, res, next) {
  try {
    const { token, accessCode } = req.body;
    if (!token) return ok(res, { status: "invalid" });
    const result = await resolve(token, accessCode);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware for the /api/private-projects/:token/* routes. Re-validates
 * the token on every request (never trusts a client-supplied projectId,
 * per spec §9) and attaches the resolved project to req.project.
 */
export async function requireValidPrivateToken(req, res, next) {
  try {
    const { token } = req.params;
    const project = await Project.findOne({ token });
    if (!project) return ok(res, { status: "invalid" });
    if (project.revoked || project.status === "disabled") return ok(res, { status: "revoked" });
    if (project.expiryDate && project.expiryDate.getTime() < Date.now()) {
      return ok(res, { status: "expired" });
    }
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
}
