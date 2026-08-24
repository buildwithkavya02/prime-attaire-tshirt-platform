import { motion } from "framer-motion";
import { PRODUCTS } from "../../data/products";
import SectionHeading from "../ui/SectionHeading";

const shots = [
  { p: PRODUCTS[0], span: "row-span-2", bg: "#3E2723" },
  { p: PRODUCTS[2], span: "", bg: "#EFE7DD" },
  { p: PRODUCTS[3], span: "", bg: "#5C4033" },
  { p: PRODUCTS[4], span: "row-span-2", bg: "#8D6E63" },
  { p: PRODUCTS[5], span: "", bg: "#C8A165" },
  { p: PRODUCTS[1], span: "", bg: "#6D4C41" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-section py-24 md:py-32">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Customer Gallery"
          title="Real designs, printed and delivered."
          description="A glimpse at what the studio has produced for our community."
        />

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] gap-5">
          {shots.map(({ p, span, bg }, i) => (
            <motion.div
              key={p.slug + i}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              className={`group relative overflow-hidden rounded-xl2 ${span}`}
              style={{ backgroundColor: bg }}
            >
              <img
                src={p.front}
                alt={p.name}
                className="h-full w-full object-contain p-8 transition-transform duration-700 ease-premium group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="p-5 text-sm font-medium text-white">{p.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
