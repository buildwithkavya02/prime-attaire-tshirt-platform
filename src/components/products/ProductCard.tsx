import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { categoryLabel } from "../../data/categories";

const FALLBACK_IMAGE = "/images/logo.png";

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const [imgSrc, setImgSrc] = useState(product.thumbnail || product.front || FALLBACK_IMAGE);
  const hasSecondImage = Boolean(product.back && product.back !== product.front);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.basePrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group overflow-hidden rounded-xl3 border border-line bg-section transition-shadow duration-500 hover:shadow-premium"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-section">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className={`absolute inset-0 h-full w-full object-contain p-10 transition-all duration-700 ease-premium group-hover:scale-110 ${
              hasSecondImage ? "group-hover:opacity-0" : ""
            }`}
          />
          {hasSecondImage && (
            <img
              src={product.back}
              alt={`${product.name} — back`}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-contain p-10 opacity-0 transition-all duration-700 ease-premium group-hover:opacity-100"
            />
          )}

          {product.featured && (
            <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-brown-dark/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-md">
              <Sparkles size={11} /> Featured
            </span>
          )}

          {product.colors.length > 0 && (
            <div className="absolute right-5 top-5 flex gap-1.5">
              {product.colors.slice(0, 5).map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="h-4 w-4 rounded-full border border-white/60 shadow-sm"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                {categoryLabel(product.type)}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">{product.name}</h3>
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-ink">
              &#8377;{product.basePrice}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">&#8377;{product.originalPrice}</span>
            )}
          </div>

          {product.colors.length > 0 && (
            <p className="mt-1.5 text-xs text-muted">
              Available in {product.colors.length} colour{product.colors.length === 1 ? "" : "s"}
            </p>
          )}

          <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brown-dark/15 py-3 text-sm font-semibold text-ink transition-all duration-400 group-hover:bg-brown-dark group-hover:text-gold group-hover:border-brown-dark">
            View Details <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
