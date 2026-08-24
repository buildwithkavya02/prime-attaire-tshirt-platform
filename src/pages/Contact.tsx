import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {  Phone, Mail, Clock, MessageCircle } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const info = [
  // {
  //   icon: MapPin,
  //   title: "Studio Address",
  //   lines: [" Prime Attaire Apparel Pvt Ltd, Plot No. 7", "T.V. Nagar, Othakkadai", "Madurai – 625107, Tamil Nadu, India"],
  // },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 9962605619", "+91 9962290093"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["kameshjaya5@gmail.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    lines: ["Mon – Sat: 10:00 AM – 7:00 PM IST", "Sunday: WhatsApp support only"],
  },
];

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Contact form", data);
    toast.success("Message sent — we'll reply within a few hours.");
    reset();
  };

  return (
    <div className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Contact"
          title="We'd love to hear from you."
          description="Reach out for order support, bulk pricing, or just to say hello."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {info.map(({ icon: Icon, title, lines }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-xl2 border border-line bg-section p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg text-brown-dark">
                <Icon size={19} />
              </span>
              <div>
                <h3 className="font-display font-semibold text-ink">{title}</h3>
                {lines.map((l) => (
                  <p key={l} className="mt-1 text-sm text-muted">
                    {l}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-xl3 border border-line min-h-[380px]"
          >
            <img src="/images/contact-art.jpg" alt="Studio location" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/60 to-transparent" />
            <a
              href="https://wa.me/9962605619"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-full bg-bg py-3.5 text-sm font-semibold text-ink shadow-premium"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              Chat with us on WhatsApp
            </a>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-xl3 border border-line bg-section p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <input
                  {...register("name", { required: true })}
                  placeholder="First Name"
                  className="input-lux"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">Name is required</p>}
              </div>
              <input {...register("phone")} placeholder="Mobile" className="input-lux" />
            </div>
            <input
              {...register("email", { pattern: /^\S+@\S+\.\S+$/ })}
              placeholder="Email"
              className="input-lux"
            />
            <textarea
              {...register("message", { required: true })}
              placeholder="Message"
              rows={5}
              className="input-lux resize-none"
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
