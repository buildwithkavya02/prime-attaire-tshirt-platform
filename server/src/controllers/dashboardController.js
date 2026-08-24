import Project from "../models/Project.js";
import Design from "../models/Design.js";
import { ok } from "../utils/response.js";
import { serializeProject } from "./projectController.js";

export async function getDashboardStats(req, res, next) {
  try {
    const now = new Date();

    const [activeProjects, pendingDesigns, approvedDesigns, activePrivateLinks] =
      await Promise.all([
        Project.countDocuments({ status: "active", revoked: false }),
        Design.countDocuments({ status: "SUBMITTED" }),
        Design.countDocuments({ status: "APPROVED" }),
        Project.countDocuments({
          status: "active",
          revoked: false,
          $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
        }),
      ]);

    const recentProjectsRaw = await Project.find().sort({ createdAt: -1 }).limit(5);
    const recentDesignsRaw = await Design.find().sort({ updatedAt: -1 }).limit(5);
    const projectIds = recentDesignsRaw.map((d) => d.projectId);
    const relatedProjects = await Project.find({ _id: { $in: projectIds } });
    const byId = new Map(relatedProjects.map((p) => [p._id.toString(), p]));

    return ok(res, {
      activeProjects,
      pendingDesigns,
      approvedDesigns,
      activeLinks: activePrivateLinks,
      recentProjects: recentProjectsRaw.map(serializeProject),
      recentDesigns: recentDesignsRaw.map((d) => ({
        id: d._id.toString(),
        projectId: d.projectId.toString(),
        color: d.color,
        layers: d.layers,
        status: d.status,
        adminFeedback: d.adminFeedback,
        previewDataUrl: d.previewDataUrl,
        submittedAt: d.submittedAt ? d.submittedAt.toISOString() : null,
        updatedAt: d.updatedAt.toISOString(),
        project: byId.get(d.projectId.toString())
          ? serializeProject(byId.get(d.projectId.toString()))
          : undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
}
