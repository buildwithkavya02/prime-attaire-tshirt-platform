import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const faqs = [
  {
    q: "What file formats can I upload for my design?",
    a: "We accept PNG, JPG and SVG files up to 10MB. For best print quality, upload artwork at 300 DPI or higher.",
  },
  {
    q: "How long does production take?",
    a: "Standard orders are produced in 5–7 business days after design approval. Expedited production is available at checkout.",
  },
  {
    q: "Can I order a single custom piece, or only in bulk?",
    a: "Both — order a single statement piece or scale up to thousands of units. Pricing per unit decreases with quantity.",
  },
  {
    q: "What printing method is best for my design?",
    a: "It depends on your artwork and fabric. Photographic, full-color designs suit DTF or sublimation, while bold logos work beautifully in screen print or embroidery. We'll advise after reviewing your upload.",
  },
  {
    q: "Is my uploaded artwork kept private?",
    a: "Yes. All uploads are encrypted in transit and used solely to produce your order — never shared or reused.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-section py-24 md:py-32">
      <div className="container-lux grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered."
          description="Can't find what you're looking for? Reach out and our team will respond within a few hours."
        />

        <div className="divide-y divide-line border-t border-b border-line">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-base md:text-lg font-medium text-ink">{f.q}</span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line transition-all duration-400 ease-premium ${
                      isOpen ? "rotate-45 bg-brown-dark border-brown-dark text-gold" : "text-ink"
                    }`}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-14 text-sm leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
