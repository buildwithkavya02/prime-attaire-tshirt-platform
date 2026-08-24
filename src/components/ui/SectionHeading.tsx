import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <span className="eyebrow">
        <span className="h-px w-6 bg-gold" />
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-3xl md:text-[2.75rem] leading-[1.1] font-semibold ${
          light ? "text-bg" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base md:text-lg ${light ? "text-bg/70" : "text-muted"}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
