import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";
import SectionHeading from "../ui/SectionHeading";

export default function FeaturedCategories() {
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="container-lux">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <SectionHeading
            eyebrow="The Collection"
            title="Six silhouettes. Endless possibilities."
            description="Every category is a blank canvas, ready for your colors, artwork and text."
          />
          <Link
            to="/products"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-transparent hover:border-gold transition-colors pb-1"
          >
            View all products <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-xl3 border border-line bg-section"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.front}
                  alt={p.name}
                  className="h-full w-full object-contain p-10 transition-transform duration-700 ease-premium group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <Link
                  to={`/products?category=${p.slug}`}
                  className="absolute bottom-6 left-6 right-6 flex translate-y-6 items-center justify-center gap-2 rounded-full bg-bg py-3 text-sm font-semibold text-ink opacity-0 shadow-premium transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Browse {p.name} <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h3 className="font-display font-semibold text-ink">{p.name}</h3>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brown-dark/15 text-brown-dark transition-all duration-300 group-hover:bg-brown-dark group-hover:text-gold">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex md:hidden justify-center">
          <Link to="/products" className="btn-secondary">
            View all products <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
