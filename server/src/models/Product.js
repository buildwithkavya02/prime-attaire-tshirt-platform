import mongoose from "mongoose";

const PRODUCT_TYPES = ["round-neck", "v-neck", "polo", "sleeveless", "hoodie", "full-sleeve"];
const PRODUCT_STATUSES = ["draft", "active", "inactive"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: {
      type: String,
      required: true,
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"],
    },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const customizationSchema = new mongoose.Schema(
  {
    front: { type: Boolean, default: true },
    back: { type: Boolean, default: true },
    uploadImage: { type: Boolean, default: true },
    text: { type: Boolean, default: true },
    color: { type: Boolean, default: true },
    font: { type: Boolean, default: true },
    deleteDesign: { type: Boolean, default: true },
    multipleDesigns: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: PRODUCT_TYPES, default: "round-neck" },
    description: { type: String, default: "" },
    basePrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: PRODUCT_STATUSES, default: "draft" },

    // Media
    thumbnail: { type: String, default: "" },
    front: { type: String, required: true },
    back: { type: String, required: true },
    previewImage: { type: String, default: "" },
    images360: { type: [String], default: [] },

    // Colors — colorPalette is the rich, admin-managed source of truth.
    // `colors` (hex-only strings) is kept in sync for backward compatibility
    // with the existing customer-facing color picker.
    colorPalette: { type: [colorSchema], default: [] },
    colors: { type: [String], default: [] },

    customization: { type: customizationSchema, default: () => ({}) },

    sizes: { type: [String], default: [...ALL_SIZES] },
    stock: { type: Number, default: 0, min: 0, validate: { validator: Number.isInteger, message: "stock must be a whole number" } },

    // Admin-controlled — surfaces the product first when the storefront is
    // sorted by "Featured". Never inferred/hardcoded on the client.
    featured: { type: Boolean, default: false },

    // Kept for backward compatibility with the original `active` boolean.
    // Derived from `status` on write; `status` is the source of truth going forward.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre("validate", function syncDerivedFields(next) {
  if (Array.isArray(this.colorPalette) && this.colorPalette.length > 0) {
    this.colors = this.colorPalette.filter((c) => c.active !== false).map((c) => c.hex);
  }
  this.active = this.status ? this.status === "active" : this.active;
  next();
});

productSchema.statics.TYPES = PRODUCT_TYPES;
productSchema.statics.STATUSES = PRODUCT_STATUSES;
productSchema.statics.ALL_SIZES = ALL_SIZES;

export default mongoose.model("Product", productSchema);
