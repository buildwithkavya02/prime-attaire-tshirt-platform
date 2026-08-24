import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "9962605619";

interface Props {
  message?: string;
}

export default function WhatsAppButton({ message }: Props) {
  const defaultMessage =
    "Hello, I have completed my custom T-Shirt design. Please review my design and provide pricing details.";

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message || defaultMessage
  )}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 16 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-premium"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <MessageCircle size={26} fill="white" strokeWidth={0} className="relative" />
    </motion.a>
  );
}
