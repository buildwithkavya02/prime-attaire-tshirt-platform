import mongoose from "mongoose";

// Layers are stored as-is (flexible shape: text or image layers, positions,
// rotation, etc). Uploaded artwork arrives from the browser as a base64
// data URL (see UploadPanel.tsx) and is stored inline on the layer — this
// keeps the backend simple and avoids standing up file storage for a
// low-budget project. If artwork volume grows this can be swapped for real
// object storage later without changing the API shape much.
const layerSchema = new mongoose.Schema({}, { strict: false, _id: false });

const designSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true, // one current design per project — no version history (see spec §12)
      index: true,
    },
    productSlug: { type: String, default: "" },
    color: { type: String, default: "" },
    layers: { type: [layerSchema], default: [] },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "REVISION_REQUIRED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    adminFeedback: { type: String, default: null },
    previewDataUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Design", designSchema);
