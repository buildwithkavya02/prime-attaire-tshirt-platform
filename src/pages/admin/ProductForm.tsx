import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import ColorManager from "../../components/admin/ColorManager";
import CustomizationSettingsPanel from "../../components/admin/CustomizationSettingsPanel";
import { createProduct, getProduct, updateProduct, uploadProductImage } from "../../lib/api";
import {
  PRODUCT_SIZES,
  PRODUCT_TYPES,
  type AdminProductColor,
  type AdminProductCustomization,
  type ProductStatus,
  type ProductType,
} from "../../types/admin";

const DEFAULT_CUSTOMIZATION: AdminProductCustomization = {
  front: true,
  back: true,
  uploadImage: true,
  text: true,
  color: true,
  font: true,
  deleteDesign: true,
  multipleDesigns: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ProductType>("round-neck");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [status, setStatus] = useState<ProductStatus>("draft");

  const [thumbnail, setThumbnail] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [colorPalette, setColorPalette] = useState<AdminProductColor[]>([]);
  const [customization, setCustomization] = useState<AdminProductCustomization>(
    DEFAULT_CUSTOMIZATION
  );
  const [sizes, setSizes] = useState<string[]>([...PRODUCT_SIZES]);
  const [stock, setStock] = useState<number>(0);
  const [featured, setFeatured] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProduct(id)
      .then((product) => {
        if (!product || cancelled) return;
        setName(product.name);
        setSlug(product.slug);
        setSlugTouched(true);
        setType(product.type);
        setDescription(product.description || "");
        setBasePrice(product.basePrice);
        setStatus(product.status);
        setThumbnail(product.thumbnail || "");
        setFront(product.front || "");
        setBack(product.back || "");
        setPreviewImage(product.previewImage || "");
        setColorPalette(product.colorPalette || []);
        setCustomization(product.customization || DEFAULT_CUSTOMIZATION);
        setSizes(product.sizes?.length ? product.sizes : [...PRODUCT_SIZES]);
        setStock(product.stock ?? 0);
        setFeatured(Boolean(product.featured));
      })
      .catch(() => toast.error("Unable to load product. Please try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const toggleSize = (size: string) => {
    setSizes((list) => (list.includes(size) ? list.filter((s) => s !== size) : [...list, size]));
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Product name is required.";
    if (!front.trim() || !back.trim()) return "Front and back images are required.";
    if (basePrice < 0 || Number.isNaN(basePrice)) return "Base price must be a valid number.";
    if (stock < 0 || Number.isNaN(stock)) return "Quantity must be a valid non-negative number.";
    if (!Number.isInteger(stock)) return "Quantity must be a whole number.";
    for (const c of colorPalette) {
      if (!c.name.trim()) return "Every color needs a name.";
      if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c.hex)) return `Invalid hex code: ${c.hex}`;
    }
    return null;
  };

  const buildPayload = (overrideStatus?: ProductStatus) => ({
    name: name.trim(),
    slug: slug.trim() || slugify(name),
    type,
    description,
    basePrice: Number(basePrice),
    status: overrideStatus ?? status,
    thumbnail,
    front,
    back,
    previewImage,
    images360: [],
    colorPalette,
    customization,
    sizes,
    stock: Number(stock),
    featured,
  });

  const handleFileUpload = async (
    field: "thumbnail" | "front" | "back" | "previewImage",
    file: File | undefined
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploadingField(field);
    try {
      const { url } = await uploadProductImage(file);
      const setters = { thumbnail: setThumbnail, front: setFront, back: setBack, previewImage: setPreviewImage };
      setters[field](url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to upload image. Please try again.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (overrideStatus?: ProductStatus) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(overrideStatus);
      if (isEdit && id) {
        await updateProduct(id, payload);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully.");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Edit Product" : "Add Product"}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-section" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? "Edit Product" : "Add Product"}
      description={
        isEdit
          ? "Update product information, media, colors and customization options."
          : "Create a new printable product for your catalog."
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 pb-24">
        {/* Basic Information */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Product Name</label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
                placeholder="e.g. Premium Round Neck Tee"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Slug</label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm font-mono outline-none focus:border-gold"
                placeholder="premium-round-neck-tee"
              />
              <p className="mt-1 text-xs text-muted">
                Auto-generated from the name. Uniqueness is enforced automatically on save.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Product Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t
                      .split("-")
                      .map((w) => w[0].toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Base Price (₹)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-line py-2 pl-7 pr-3 text-sm outline-none focus:border-gold"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">Manually set the selling price. Negative values aren't allowed.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Product Media
          </h2>
          <p className="text-xs text-muted">
            Upload an image, or paste a path/URL directly (e.g. an existing{" "}
            <code>/images/...</code> asset).
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Thumbnail"
              value={thumbnail}
              onChangeValue={setThumbnail}
              onUploadFile={(f) => handleFileUpload("thumbnail", f)}
              uploading={uploadingField === "thumbnail"}
            />
            <ImageUploadField
              label="Front Image"
              required
              value={front}
              onChangeValue={setFront}
              onUploadFile={(f) => handleFileUpload("front", f)}
              uploading={uploadingField === "front"}
            />
            <ImageUploadField
              label="Back Image"
              required
              value={back}
              onChangeValue={setBack}
              onUploadFile={(f) => handleFileUpload("back", f)}
              uploading={uploadingField === "back"}
            />
            <ImageUploadField
              label="Preview Image"
              value={previewImage}
              onChangeValue={setPreviewImage}
              onUploadFile={(f) => handleFileUpload("previewImage", f)}
              uploading={uploadingField === "previewImage"}
            />
          </div>
        </section>

        {/* Colors */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Colors
          </h2>
          <ColorManager colors={colorPalette} onChange={setColorPalette} />
        </section>

        {/* Customization */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Customization Options
          </h2>
          <CustomizationSettingsPanel value={customization} onChange={setCustomization} />
        </section>

        {/* Sizes */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Available Sizes
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  sizes.includes(size)
                    ? "border-brown-dark bg-brown-dark text-gold"
                    : "border-line text-muted hover:border-brown-dark/40"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </section>

        {/* Inventory & visibility */}
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Inventory &amp; Visibility
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Quantity</label>
              <input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(Math.max(0, Math.trunc(Number(e.target.value))))}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <p className="mt-1 text-[11px] text-muted">
                Available stock quantity. Whole numbers only — no negative values.
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                Featured — show first when customers sort by "Featured"
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-5 py-4 backdrop-blur-md lg:pl-64">
        <div className="mx-auto flex max-w-3xl justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-section disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-section disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(isEdit ? undefined : "active")}
            disabled={saving}
            className="rounded-full bg-brown-dark px-5 py-2.5 text-sm font-semibold text-gold hover:bg-brown-dark/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function ImageUploadField({
  label,
  required,
  value,
  onChangeValue,
  onUploadFile,
  uploading,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeValue: (v: string) => void;
  onUploadFile: (file: File | undefined) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onUploadFile(e.dataTransfer.files?.[0]);
          }}
          className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-muted transition-colors ${
            dragOver ? "border-gold bg-gold/10" : "border-dashed border-line hover:border-brown-dark/40"
          }`}
          aria-label={`Upload ${label}`}
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-brown-dark" />
          ) : value ? (
            <img src={value} alt={label} className="h-full w-full bg-section object-contain" />
          ) : (
            <Upload size={18} />
          )}
        </button>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onUploadFile(e.target.files?.[0])}
          />
          <input
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            placeholder="/images/product-front.png or click to upload"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <p className="mt-1 text-[11px] text-muted">Click the tile to upload, or paste a URL/path.</p>
        </div>
      </div>
    </div>
  );
}
