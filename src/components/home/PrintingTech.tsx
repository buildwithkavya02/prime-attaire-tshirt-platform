// import { motion } from "framer-motion";
// import { Layers, Grid3x3, Scissors, Sticker, Droplets } from "lucide-react";
// import SectionHeading from "../ui/SectionHeading";

// const tech = [
//   { icon: Layers, name: "DTF", desc: "Vivid, durable transfers for detailed full-color artwork on any fabric." },
//   { icon: Grid3x3, name: "Screen Printing", desc: "The gold standard for bold, high-volume orders with crisp solid colors." },
//   { icon: Scissors, name: "Embroidery", desc: "Stitched texture and dimension for logos that need to last a lifetime." },
//   { icon: Sticker, name: "Vinyl", desc: "Sharp-edged lettering and numbering with a clean matte or gloss finish." },
//   { icon: Droplets, name: "Sublimation", desc: "All-over, edge-to-edge prints that never crack, fade or peel." },
// ];

// export default function PrintingTech() {
//   return (
//     <section id="printing" className="bg-bg py-24 md:py-32">
//       <div className="container-lux">
//         <SectionHeading
//           eyebrow="Printing Technologies"
//           title="The right technique for every design."
//           description="Upload your artwork and we'll recommend the ideal process — or choose your own."
//           align="center"
//         />

//         <div className="mt-14 flex flex-wrap justify-center gap-5">
//           {tech.map(({ icon: Icon, name, desc }, i) => (
//             <motion.div
//               key={name}
//               initial={{ opacity: 0, y: 24 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, margin: "-60px" }}
//               transition={{ duration: 0.55, delay: i * 0.08 }}
//               whileHover={{ y: -6, borderColor: "#C8A165" }}
//               className="w-full sm:w-[300px] rounded-xl2 border border-line bg-section p-8 text-center transition-colors duration-500"
//             >
//               <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg text-brown-dark shadow-soft">
//                 <Icon size={22} />
//               </span>
//               <h3 className="mt-6 font-display text-lg font-semibold text-ink">{name}</h3>
//               <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
