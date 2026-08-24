import { motion } from "framer-motion";
import { ArrowUpRight, RotateCw, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Button from "../ui/Button";

const trust = [
  { icon: RotateCw, label: "360° Live Preview" },
  { icon: Sparkles, label: "Premium Printing" },
  { icon: Zap, label: "Fast Production" },
  { icon: ShieldCheck, label: "Secure Design Upload" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-32 md:pt-40 pb-16 md:pb-24">
      <div className="container-lux grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left: image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative aspect-[4/5] rounded-xl3 overflow-hidden shadow-premium">
            <img
              src="/images/hero-bg.png"
              alt="Premium custom apparel studio"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/50 via-transparent to-transparent" />


          </div>

        </motion.div>

        {/* Right: content */}
        <div className="order-1 lg:order-2">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <span className="h-px w-6 bg-gold" />
            Premium Custom Apparel Studio
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-semibold leading-[0.98] tracking-tight"
          >
            Design.
            <br />
            Customize.
            <br />
            <span className="text-gradient-gold">Print. Wear.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-7 max-w-xl text-base md:text-lg leading-relaxed text-muted"
          >
            Create premium custom apparel with an interactive design experience. Customize
            colors, upload artwork, add personalized text, preview every detail, rotate
            products in 360 degrees and submit your design with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button to="/products" icon={<ArrowUpRight size={17} />}>
              Browse Products
            </Button>
            <Button to="/contact" variant="secondary">
              Talk to Us
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 border-t border-line pt-8"
          >
            {trust.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-section text-brown">
                  <Icon size={15} />
                </span>
                <span className="text-xs font-medium text-ink leading-tight">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
    </section>
  );
}
