import Product from "../models/Product.js";
import { ok, fail } from "../utils/response.js";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// Mirrors src/data/ProductColors.ts — the studio's fixed 8-color catalog
// palette. Kept in sync manually since the client and server are separate
// packages; update both if the official color sheet ever changes.
const ALLOWED_PRODUCT_COLOR_HEXES = new Set([
  "#4c2d23", // Espresso Brown
  "#388c63", // Forest Green
  "#0c5fce", // Royal Blue
  "#000000", // Black
  "#ffffff", // White
  "#d71e14", // Signal Red
  "#183761", // Navy
  "#ded3d3", // Dusty Rose
]);

function serialize(p) {
  return {
    id: p._id.toString(),
    slug: p.slug,
    name: p.name,
    type: p.type,
    description: p.description,
    basePrice: p.basePrice,
    status: p.status,
    active: p.active,
    thumbnail: p.thumbnail,
    front: p.front,
    back: p.back,
    previewImage: p.previewImage,
    images360: p.images360,
    colorPalette: (p.colorPalette || []).map((c) => ({
      id: c._id?.toString(),
      name: c.name,
      hex: c.hex,
      image: c.image,
      active: c.active,
    })),
    colors: p.colors,
    customization: p.customization,
    sizes: p.sizes,
    stock: p.stock,
    featured: p.featured,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

async function generateUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validateColorPalette(colorPalette) {
  if (!Array.isArray(colorPalette)) return null;
  for (const c of colorPalette) {
    if (!c || !c.name || !c.hex) return "Each color requires a name and hex code.";
    if (!HEX_RE.test(c.hex)) return `Invalid hex code: ${c.hex}`;
    if (!ALLOWED_PRODUCT_COLOR_HEXES.has(c.hex.toLowerCase())) {
      return `${c.hex} is not one of the studio's predefined product colors.`;
    }
  }
  return null;
}

// GET /api/products — public storefront (active products only)
export async function listPublicProducts(req, res, next) {
  try {
    const products = await Product.find({ status: "active" });
    return ok(res, products.map(serialize));
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/products — admin panel (search, filter, sort)
export async function listAdminProducts(req, res, next) {
  try {
    const { search, status, type, sort } = req.query;
    const query = {};
    if (search) query.name = { $regex: String(search).trim(), $options: "i" };
    if (status && status !== "all") query.status = status;
    if (type && type !== "all") query.type = type;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "name-asc": { name: 1 },
      "name-desc": { name: -1 },
      "price-asc": { basePrice: 1 },
      "price-desc": { basePrice: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.newest;

    const products = await Product.find(query).sort(sortSpec);
    return ok(res, products.map(serialize));
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/products/:id
export async function getAdminProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, "Product not found.", 404);
    return ok(res, serialize(product));
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const {
      slug,
      name,
      type,
      basePrice,
      front,
      back,
      thumbnail,
      previewImage,
      images360,
      colorPalette,
      sizes,
      description,
      status,
      customization,
      stock,
      featured,
    } = req.body;

    if (!name || basePrice === undefined || !front || !back) {
      return fail(res, "name, basePrice, front and back are required.", 400);
    }
    if (typeof basePrice !== "number" || basePrice < 0) {
      return fail(res, "basePrice must be a non-negative number.", 400);
    }
    if (stock !== undefined && (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock))) {
      return fail(res, "stock must be a non-negative whole number.", 400);
    }
    if (type && !Product.TYPES.includes(type)) {
      return fail(res, `Invalid product type. Must be one of: ${Product.TYPES.join(", ")}`, 400);
    }
    if (status && !Product.STATUSES.includes(status)) {
      return fail(res, `Invalid status. Must be one of: ${Product.STATUSES.join(", ")}`, 400);
    }
    const colorError = validateColorPalette(colorPalette);
    if (colorError) return fail(res, colorError, 400);

    const baseSlug = slugify(slug || name);
    if (!baseSlug) return fail(res, "Could not derive a valid slug from the product name.", 400);
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const product = await Product.create({
      slug: uniqueSlug,
      name,
      type: type || undefined,
      basePrice,
      front,
      back,
      thumbnail: thumbnail || "",
      previewImage: previewImage || "",
      images360: Array.isArray(images360) ? images360 : [],
      colorPalette: Array.isArray(colorPalette) ? colorPalette : [],
      sizes: Array.isArray(sizes) ? sizes : undefined,
      description: description || "",
      status: status || "draft",
      customization: customization && typeof customization === "object" ? customization : undefined,
      stock: typeof stock === "number" ? stock : 0,
      featured: Boolean(featured),
    });
    return ok(res, serialize(product), 201);
  } catch (err) {
    if (err.name === "ValidationError") return fail(res, err.message, 400);
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const patch = { ...req.body };
    delete patch._id;

    if (patch.type && !Product.TYPES.includes(patch.type)) {
      return fail(res, `Invalid product type. Must be one of: ${Product.TYPES.join(", ")}`, 400);
    }
    if (patch.status && !Product.STATUSES.includes(patch.status)) {
      return fail(res, `Invalid status. Must be one of: ${Product.STATUSES.join(", ")}`, 400);
    }
    if (patch.basePrice !== undefined && (typeof patch.basePrice !== "number" || patch.basePrice < 0)) {
      return fail(res, "basePrice must be a non-negative number.", 400);
    }
    if (patch.stock !== undefined && (typeof patch.stock !== "number" || patch.stock < 0 || !Number.isInteger(patch.stock))) {
      return fail(res, "stock must be a non-negative whole number.", 400);
    }
    if (patch.featured !== undefined) patch.featured = Boolean(patch.featured);
    const colorError = validateColorPalette(patch.colorPalette);
    if (colorError) return fail(res, colorError, 400);

    if (patch.slug) {
      const baseSlug = slugify(patch.slug);
      patch.slug = await generateUniqueSlug(baseSlug, req.params.id);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!product) return fail(res, "Product not found.", 404);
    return ok(res, serialize(product));
  } catch (err) {
    if (err.name === "ValidationError") return fail(res, err.message, 400);
    next(err);
  }
}

// PATCH /api/admin/products/:id/status
export async function updateProductStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status || !Product.STATUSES.includes(status)) {
      return fail(res, `status must be one of: ${Product.STATUSES.join(", ")}`, 400);
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!product) return fail(res, "Product not found.", 404);
    return ok(res, serialize(product));
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products/:id/duplicate
export async function duplicateProduct(req, res, next) {
  try {
    const source = await Product.findById(req.params.id);
    if (!source) return fail(res, "Product not found.", 404);

    const data = source.toObject();
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.__v;
    data.name = `${data.name} (Copy)`;
    data.status = "draft";
    data.slug = await generateUniqueSlug(slugify(data.name));
    // Let mongoose regenerate subdocument _ids for colorPalette
    data.colorPalette = (data.colorPalette || []).map(({ _id, ...rest }) => rest);

    const copy = await Product.create(data);
    return ok(res, serialize(copy), 201);
  } catch (err) {
    if (err.name === "ValidationError") return fail(res, err.message, 400);
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return fail(res, "Product not found.", 404);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
