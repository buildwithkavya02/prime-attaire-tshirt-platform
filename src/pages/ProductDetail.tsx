import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getPublicProducts } from "../lib/api";
import type { Product } from "../types";
import { getColorName } from "../data/ProductColors";
import { categoryLabel } from "../data/categories";
import { STUDIO_WHATSAPP_NUMBER } from "../config/Studio";

export default function ProductDetail() {
  const { slug = "" } = useParams();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState<"front" | "back">("front");

  useEffect(() => {
    let active = true;
    setProducts(null);
    setError(false);
    setActiveImage("front");
    getPublicProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const product = useMemo(
    () => products?.find((p) => p.slug === slug) ?? null,
    [products, slug]
  );

  const whatsappHref = useMemo(() => {
    if (!product) return "#";
    const lines = [
      "Hello, I'm interested in customizing this product from Prime Attaire.",
      "",
      `Product: ${product.name}`,
      `Price: ₹${product.basePrice}`,
      "",
      "Could you please share more details and set up my private design link?",
    ];
    return `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [product]);

  // Loading
  if (products === null && !error) {
    return (
      <div className="container-lux pt-32 md:pt-40 pb-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-xl3 bg-section" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded-full bg-line/60" />
            <div className="h-8 w-2/3 animate-pulse rounded-full bg-line/60" />
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-line/60" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-line/40" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="container-lux flex flex-col items-center gap-4 pt-40 pb-32 text-center">
        <AlertCircle className="h-10 w-10 text-muted" />
        <p className="font-display text-lg font-semibold text-ink">Unable to load this product.</p>
        <Link to="/products" className="btn-secondary mt-2">
          Back to Products
        </Link>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="container-lux flex flex-col items-center gap-4 pt-40 pb-32 text-center">
        <PackageSearch className="h-10 w-10 text-muted" />
        <div>
          <p className="font-display text-lg font-semibold text-ink">Product not found.</p>
          <p className="mt-1 text-sm text-muted">
            It may have been removed or is no longer available.
          </p>
        </div>
        <Link to="/products" className="btn-secondary mt-2">
          Back to Products
        </Link>
      </div>
    );
  }

  const hasBack = Boolean(product.back && product.back !== product.front);
  const displayImage = activeImage === "back" && hasBack ? product.back : product.front;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.basePrice);

  return (
    <div className="relative pt-28 md:pt-36 pb-24 md:pb-32">
      <div className="container-lux">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to Products
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 md:mt-10 md:grid-cols-2 md:gap-14">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl3 border border-line bg-section">
              <img
                src={displayImage || "/images/logo.png"}
                alt={product.name}
                className="h-full w-full object-contain p-10"
              />
              {product.featured && (
                <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-brown-dark/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-md">
                  <Sparkles size={11} /> Featured
                </span>
              )}
            </div>
            {hasBack && (
              <div className="mt-4 flex items-center gap-2">
                {(["front", "back"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setActiveImage(side)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition-all duration-300 ${
                      activeImage === side
                        ? "border-brown-dark bg-brown-dark text-gold"
                        : "border-line text-muted hover:border-brown-dark/40"
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {categoryLabel(product.type)}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-ink">₹{product.basePrice}</span>
              {hasDiscount && (
                <span className="text-base text-muted line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            )}

            {product.colors?.length > 0 && (
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                  Available Colors
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors.map((hex) => (
                    <span
                      key={hex}
                      title={getColorName(hex)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className="h-9 w-9 rounded-full ring-1 ring-line"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] text-muted">{getColorName(hex)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length ? (
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                  Available Sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Private customization explainer */}
            <div className="mt-9 rounded-2xl border border-line bg-section/60 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brown-dark/10 text-brown-dark">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Customization is handled personally
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Message us on WhatsApp about this product and we'll set up a private design
                    link just for you — upload artwork, add text and preview your design in
                    360° before you order.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.01]"
              >
                <MessageCircle size={16} /> Contact Admin on WhatsApp
              </a>
              <Link to="/request-quote" className="btn-secondary">
                Request a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
