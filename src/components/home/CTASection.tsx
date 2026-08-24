import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";

export default function CTASection() {
  return (
    <section className="bg-bg px-4 md:px-10 pb-24 md:pb-32 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="container-lux relative overflow-hidden rounded-xl3 bg-brown-dark px-8 py-16 md:px-20 md:py-24 text-center"
      >
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gold/15 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-brown-warm/15 blur-[100px]" />

        <span className="eyebrow">
          <span className="h-px w-6 bg-gold" />
          Ready When You Are
        </span>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl md:text-5xl font-semibold leading-[1.1] text-bg">
          Ready to design your own apparel?
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base text-bg/65">
          Browse the catalog, pick a product and connect with our team on WhatsApp to start
          your custom design.
        </p>
        <div className="mt-9 flex justify-center">
          <Button to="/products" icon={<ArrowUpRight size={17} />}>
            Browse Products
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
