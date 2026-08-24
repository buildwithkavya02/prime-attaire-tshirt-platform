import { motion } from "framer-motion";
import { MousePointerClick, Palette, Eye, Send } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  { icon: MousePointerClick, title: "Choose Product", desc: "Pick from six premium silhouettes to start your design." },
  { icon: Palette, title: "Customize", desc: "Set your color, upload artwork, add text and fine-tune placement." },
  { icon: Eye, title: "Preview", desc: "Rotate in 360° and inspect front, back and side views instantly." },
  { icon: Send, title: "Send Request", desc: "Submit your design for a detailed quote within minutes." },
];

export default function HowItWorks() {
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="container-lux">
        <SectionHeading eyebrow="The Process" title="From idea to order in four steps." align="center" />

        <div className="relative mt-16">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-line md:-translate-x-1/2 hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brown-dark text-gold shadow-premium">
                  <Icon size={24} />
                </span>
                <span className="mt-5 text-xs font-semibold tracking-[0.2em] text-gold">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
