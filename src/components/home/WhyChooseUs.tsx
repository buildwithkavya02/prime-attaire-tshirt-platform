import { motion } from "framer-motion";
import { RotateCw, Palette, Shirt, Printer, Boxes, ShieldCheck, Timer } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const items = [
  { icon: RotateCw, title: "360° Live Preview", desc: "Rotate every product in real time and see your design from every angle before you commit." },
  { icon: Palette, title: "Unlimited Color Selection", desc: "A full spectrum of garment and print colors, previewed instantly on your chosen product." },
  { icon: Shirt, title: "Premium Fabric", desc: "Heavyweight combed cotton and fleece blends, chosen for drape, durability and comfort." },
  { icon: Printer, title: "Professional Printing", desc: "DTF, screen print, embroidery, vinyl and sublimation — matched to your artwork automatically." },
  { icon: Boxes, title: "Bulk Orders", desc: "From a single statement piece to a thousand-unit team order, pricing scales with you." },
  { icon: ShieldCheck, title: "Secure Artwork Upload", desc: "Your files are encrypted in transit and only ever used to produce your order." },
  { icon: Timer, title: "Fast Turnaround", desc: "Standard production in 5–7 days, with expedited options for time-sensitive orders." },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-section py-24 md:py-32">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Why Prime Attaire"
          title="Engineered for confidence, from screen to shirt."
          description="Every tool in the studio exists to remove guesswork from your order."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`group rounded-xl2 border border-line bg-bg p-7 transition-shadow duration-500 hover:shadow-soft ${
                i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-section text-brown-dark transition-all duration-500 group-hover:bg-brown-dark group-hover:text-gold group-hover:rotate-6">
                <Icon size={20} />
              </span>
              <h3 className="mt-6 font-display font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
