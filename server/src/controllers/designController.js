import Design from "../models/Design.js";
import Project from "../models/Project.js";
import { ok, fail } from "../utils/response.js";

function serializeDesign(d) {
  return {
    id: d._id.toString(),
    projectId: d.projectId.toString(),
    color: d.color,
    layers: d.layers,
    status: d.status,
    adminFeedback: d.adminFeedback,
    previewDataUrl: d.previewDataUrl,
    submittedAt: d.submittedAt ? d.submittedAt.toISOString() : null,
    updatedAt: d.updatedAt.toISOString(),
  };
}

async function getOrCreate(projectId, productSlug) {
  let design = await Design.findOne({ projectId });
  if (!design) {
    design = await Design.create({ projectId, productSlug, layers: [], status: "DRAFT" });
  }
  return design;
}

/* ------------------------------------------------------------------ */
/*  Customer-facing — project is derived from the validated token       */
/*  (req.project is set by requireValidPrivateToken), never from the    */
/*  request body, per spec §9.                                          */
/* ------------------------------------------------------------------ */

export async function getDesignForToken(req, res, next) {
  try {
    const design = await getOrCreate(req.project._id, req.project.productSlug);
    return ok(res, serializeDesign(design));
  } catch (err) {
    next(err);
  }
}

export async function saveDraftDesign(req, res, next) {
  try {
    const { color, layers, previewDataUrl } = req.body;
    const design = await getOrCreate(req.project._id, req.project.productSlug);

    design.color = color ?? design.color;
    design.layers = Array.isArray(layers) ? layers : design.layers;
    design.previewDataUrl = previewDataUrl ?? design.previewDataUrl;
    // Saving a draft never overwrites a submitted/reviewed status — only
    // the explicit submit action moves the design forward (spec §9/§12).
    if (design.status === "DRAFT") design.status = "DRAFT";
    await design.save();

    return ok(res, serializeDesign(design));
  } catch (err) {
    next(err);
  }
}

export async function submitDesign(req, res, next) {
  try {
    const { color, layers, previewDataUrl } = req.body;
    const design = await getOrCreate(req.project._id, req.project.productSlug);

    if (color !== undefined) design.color = color;
    if (Array.isArray(layers)) design.layers = layers;
    if (previewDataUrl !== undefined) design.previewDataUrl = previewDataUrl;
    design.status = "SUBMITTED";
    design.adminFeedback = null;
    design.submittedAt = new Date();
    await design.save();

    return ok(res, serializeDesign(design));
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  Admin review                                                        */
/* ------------------------------------------------------------------ */

export async function listDesigns(req, res, next) {
  try {
    const designs = await Design.find().sort({ updatedAt: -1 });
    const projectIds = designs.map((d) => d.projectId);
    const projects = await Project.find({ _id: { $in: projectIds } });
    const byId = new Map(projects.map((p) => [p._id.toString(), p]));

    const result = designs.map((d) => ({
      ...serializeDesign(d),
      project: projectToSummary(byId.get(d.projectId.toString())),
    }));
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getDesignById(req, res, next) {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return ok(res, null);
    const project = await Project.findById(design.projectId);
    return ok(res, { ...serializeDesign(design), project: projectToSummary(project) });
  } catch (err) {
    next(err);
  }
}

function projectToSummary(p) {
  if (!p) return undefined;
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

async function setDesignStatus(req, res, next, status, requireFeedback) {
  try {
    const { feedback } = req.body;
    if (requireFeedback && !feedback?.trim()) {
      return fail(res, "Feedback is required for a revision request.", 400);
    }
    const design = await Design.findById(req.params.id);
    if (!design) return ok(res, null);

    design.status = status;
    design.adminFeedback = status === "REVISION_REQUIRED" ? feedback.trim() : null;
    if (status === "APPROVED") design.approvedAt = new Date();
    await design.save();

    return ok(res, serializeDesign(design));
  } catch (err) {
    next(err);
  }
}

export const approveDesign = (req, res, next) => setDesignStatus(req, res, next, "APPROVED", false);
export const rejectDesign = (req, res, next) => setDesignStatus(req, res, next, "REJECTED", false);
export const requestRevision = (req, res, next) =>
  setDesignStatus(req, res, next, "REVISION_REQUIRED", true);
