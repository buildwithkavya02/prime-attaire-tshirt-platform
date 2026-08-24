import Project from "../models/Project.js";
import { ok, fail } from "../utils/response.js";
import { generatePrivateToken, generateAccessCode } from "../utils/token.js";

const DEFAULT_EXPIRY_DAYS = 30;

function serializeProject(p) {
  return {
    id: p._id.toString(),
    token: p.token,
    customerName: p.customerName,
    customerPhone: p.customerPhone,
    projectName: p.projectName,
    productSlug: p.productSlug,
    allowedColors: p.allowedColors,
    expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
    accessCodeRequired: p.accessCodeRequired,
    accessCode: p.accessCode,
    notes: p.notes,
    status: p.status,
    revoked: p.revoked,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function listProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return ok(res, projects.map(serializeProject));
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return ok(res, null);
    return ok(res, serializeProject(project));
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const {
      customerName,
      customerPhone,
      projectName,
      productSlug,
      allowedColors,
      expiryDate,
      accessCodeRequired,
      notes,
    } = req.body;

    if (!customerName || !projectName || !productSlug) {
      return fail(res, "customerName, projectName and productSlug are required.", 400);
    }

    const expiry =
      expiryDate ||
      new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const project = await Project.create({
      customerName,
      customerPhone: customerPhone || "",
      projectName,
      productSlug,
      allowedColors: Array.isArray(allowedColors) ? allowedColors : [],
      notes: notes || "",
      status: "active",
      revoked: false,
      token: generatePrivateToken(),
      accessCodeRequired: accessCodeRequired !== false,
      accessCode: accessCodeRequired !== false ? generateAccessCode() : null,
      expiryDate: expiry,
    });

    return ok(res, serializeProject(project), 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const patch = { ...req.body };
    // These fields are managed by their own dedicated endpoints, never by
    // a general-purpose edit form — stops a stray field in the request
    // body from silently reassigning the link or its access code.
    delete patch.token;
    delete patch.accessCode;
    delete patch.revoked;
    delete patch.status;

    const project = await Project.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!project) return ok(res, null);
    return ok(res, serializeProject(project));
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    await Project.findByIdAndDelete(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function setProjectStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["active", "disabled"].includes(status)) {
      return fail(res, "status must be 'active' or 'disabled'.", 400);
    }
    const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!project) return ok(res, null);
    return ok(res, serializeProject(project));
  } catch (err) {
    next(err);
  }
}

export async function revokeProject(req, res, next) {
  try {
    const { revoked } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { revoked: !!revoked },
      { new: true }
    );
    if (!project) return ok(res, null);
    return ok(res, serializeProject(project));
  } catch (err) {
    next(err);
  }
}

export async function regenerateAccessCode(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return ok(res, null);
    project.accessCode = generateAccessCode();
    await project.save();
    return ok(res, serializeProject(project));
  } catch (err) {
    next(err);
  }
}

export { serializeProject };
