import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  Search,
  X,
  PackageSearch,
  AlertCircle,
} from "lucide-react";
import { getPublicProducts } from "../lib/api";
import type { Product } from "../types";
import ProductCard from "../components/products/ProductCard";
import SectionHeading from "../components/ui/SectionHeading";
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type ProductCategory } from "../data/categories";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "alpha";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "alpha", label: "Name: A – Z" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl3 border border-line bg-section">
      <div className="aspect-[4/5] animate-pulse bg-line/40" />
      <div className="space-y-3 px-6 py-6">
        <div className="h-3 w-16 animate-pulse rounded-full bg-line/60" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-line/60" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-line/60" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-full bg-line/40" />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);

  const categoryParam = (searchParams.get("category") as ProductCategory) || "all";
  const category: ProductCategory = PRODUCT_CATEGORIES.includes(categoryParam)
    ? categoryParam
    : "all";

  const setCategory = (next: ProductCategory) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("category");
    else params.set("category", next);
    setSearchParams(params, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getPublicProducts();
      setProducts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search input so filtering doesn't refire on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => clearTimeout(handle);
  }, [search]);

  const byCategory = useMemo(
    () => (category === "all" ? products : products.filter((p) => p.type === category)),
    [products, category]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch) return byCategory;
    return byCategory.filter((p) => {
      const haystack = `${p.name} ${p.type ?? ""} ${CATEGORY_LABELS[(p.type as ProductCategory) ?? "all"] ?? ""}`.toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [byCategory, debouncedSearch]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.basePrice - b.basePrice);
      case "price-desc":
        return list.sort((a, b) => b.basePrice - a.basePrice);
      case "alpha":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
        return list.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
      case "featured":
      default:
        return list.sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        });
    }
  }, [filtered, sort]);

  const prices = products.map((p) => p.basePrice);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const countLabel =
    category === "all"
      ? `${sorted.length} Product${sorted.length === 1 ? "" : "s"}`
      : `${CATEGORY_LABELS[category]}${sorted.length === 1 ? "" : "s"} · ${sorted.length} Product${
          sorted.length === 1 ? "" : "s"
        }`;

  return (
    <div className="relative pt-32 md:pt-40 pb-24 md:pb-32 overflow-hidden">
      {/* Ambient premium backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#C8A165]/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-[#3E2723]/10 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="container-lux">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 text-[#C8A165]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-medium">
              {loading ? "Loading catalog" : `${products.length} Signature Silhouettes`}
            </span>
          </div>

          <SectionHeading
            eyebrow="Full Catalog"
            title="Find the perfect blank canvas for your creativity."
            description="Choose a base garment to open the live design studio — color, artwork and text can all be adjusted before you preview in 360°."
          />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mt-10 max-w-md"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-10 text-sm outline-none transition-colors focus:border-gold"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 -mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0"
        >
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
            {PRODUCT_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  category === c
                    ? "border-brown-dark bg-brown-dark text-gold"
                    : "border-line text-muted hover:border-brown-dark/40 hover:text-ink"
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Utility bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-black/[0.06] py-4"
        >
          <p className="text-sm text-black/50 tracking-wide">
            {loading ? (
              "Loading products…"
            ) : products.length === 0 ? (
              "No products yet"
            ) : (
              <>
                {countLabel}
                {category === "all" && (
                  <>
                    {" "}
                    · From <span className="font-medium text-black/80">₹{minPrice}</span> to{" "}
                    <span className="font-medium text-black/80">₹{maxPrice}</span>
                  </>
                )}
              </>
            )}
          </p>

          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="group flex items-center gap-2 text-sm tracking-wide text-black/70 hover:text-black transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span>Sort: {SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSort(opt.key);
                          setSortOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          sort === opt.key
                            ? "bg-[#C8A165]/10 text-[#3E2723] font-medium"
                            : "text-black/60 hover:bg-black/[0.03]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Body: loading / error / empty / grid */}
        {loading ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-muted" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">Unable to load products.</p>
              <p className="mt-1 text-sm text-muted">Please check your connection and try again.</p>
            </div>
            <button onClick={load} className="btn-primary mt-2">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-muted" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">No products available yet.</p>
              <p className="mt-1 text-sm text-muted">Check back soon — new silhouettes are on the way.</p>
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-muted" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                {debouncedSearch
                  ? "No products found"
                  : `No ${CATEGORY_LABELS[category]}s available right now.`}
              </p>
              <p className="mt-1 text-sm text-muted">Try another search or category.</p>
            </div>
            {(debouncedSearch || category !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="btn-secondary mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            key={`${sort}-${category}-${debouncedSearch}`}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {sorted.map((p, i) => (
              <motion.div key={p.id ?? p.slug} variants={item}>
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom note */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-20 flex items-center justify-center gap-4 text-center"
          >
            <span className="h-px w-10 bg-black/10" />
            <p className="text-xs tracking-[0.25em] uppercase text-black/40">
              Every piece, made to order
            </p>
            <span className="h-px w-10 bg-black/10" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
