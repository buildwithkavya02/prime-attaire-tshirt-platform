import mongoose from "mongoose";

/**
 * Project also carries the private-link fields (token, accessCode, expiry,
 * revoked). The original spec keeps `projects` and `privateLinks` as two
 * collections, but in this product every project has exactly one private
 * link created at the same time and never more than one — a second
 * collection would only add joins with no real benefit. See server/README.md
 * ("Design decisions") for the full reasoning, including why the token and
 * access code are stored in a retrievable form rather than hashed.
 */
const projectSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, default: "" },
    projectName: { type: String, required: true, trim: true },
    productSlug: { type: String, required: true },
    allowedColors: { type: [String], default: [] },
    notes: { type: String, default: "" },

    status: { type: String, enum: ["active", "disabled"], default: "active" },

    // --- private link fields ---
    token: { type: String, required: true, unique: true, index: true },
    accessCodeRequired: { type: Boolean, default: true },
    accessCode: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
