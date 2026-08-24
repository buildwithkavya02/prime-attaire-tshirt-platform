import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CheckCircle2, Phone, Clock, ShieldCheck, UploadCloud } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import { PRODUCTS } from "../data/products";

interface QuoteForm {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  productType: string;
  quantity: number;
  message: string;
}

export default function RequestQuote() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteForm>();
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: QuoteForm) => {
    await new Promise((r) => setTimeout(r, 900));
    console.log("Quote request", { ...data, frontFile, backFile });
    toast.success("Quote request sent — we'll be in touch shortly!");
    setSubmitted(true);
    reset();
    setFrontFile(null);
    setBackFile(null);
  };

  const readFile = (file: File | undefined, setter: (v: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="container-lux grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <SectionHeading
            eyebrow="Get Quick Quote"
            title="Tell us about your order."
            description="Share a few details and our team will send a detailed price breakdown within minutes."
          />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 flex flex-col items-center gap-4 rounded-xl3 border border-line bg-section p-14 text-center"
            >
              <CheckCircle2 size={48} className="text-ok" />
              <h3 className="font-display text-xl font-semibold">Request received</h3>
              <p className="max-w-sm text-sm text-muted">
                Thank you — our team is reviewing your request and will reach out with pricing shortly.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary mt-2">
                Submit another request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" error={errors.fullName?.message}>
                  <input
                    {...register("fullName", { required: "Name is required" })}
                    className="input-lux"
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Email">
                  <input
                    {...register("email", {
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                    })}
                    className="input-lux"
                    placeholder="jane@email.com"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Phone Number" error={errors.phone?.message}>
                  <input
                    {...register("phone", { required: "Phone number is required" })}
                    className="input-lux"
                    placeholder="+91 90000 00000"
                  />
                </Field>
                <Field label="City">
                  <input {...register("city")} className="input-lux" placeholder="Your city" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Product Type">
                  <select {...register("productType")} className="input-lux">
                    {PRODUCTS.map((p) => (
                      <option key={p.slug} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    defaultValue={50}
                    {...register("quantity", { valueAsNumber: true, min: 1 })}
                    className="input-lux"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FileField label="Front Design Upload" onFile={(f) => readFile(f, setFrontFile)} preview={frontFile} />
                <FileField label="Back Design Upload" onFile={(f) => readFile(f, setBackFile)} preview={backFile} />
              </div>

              <Field label="Message">
                <textarea
                  {...register("message")}
                  rows={4}
                  className="input-lux resize-none"
                  placeholder="Tell us more about your project..."
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Submit Request"}
              </button>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-xl3 border border-line bg-section p-8 md:p-10 h-fit lg:sticky lg:top-32"
        >
          <h3 className="font-display text-xl font-semibold">How Studio Pricing Works</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We keep pricing simple and transparent. To calculate your quote we need to know:
          </p>
          <ul className="mt-6 space-y-4">
            {[
              "The specific product you want to customize",
              "How many print locations & sizes you need",
              "How many pieces (quantity) you'd like to order",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-ink">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-ok" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            No hidden setup charges or fees — every quote includes artwork assistance, print
            setup and guaranteed delivery dates.
          </p>

          <div className="mt-8 space-y-4 border-t border-line pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-brown-dark">
                <Phone size={16} />
              </span>
              <div>
                <p className="text-xs text-muted">Call or WhatsApp</p>
                <p className="text-sm font-semibold">+91 9962605619</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-brown-dark">
                <Clock size={16} />
              </span>
              <div>
                <p className="text-xs text-muted">Response Time</p>
                <p className="text-sm font-semibold">Within 15 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-brown-dark">
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="text-xs text-muted">Secure & Private</p>
                <p className="text-sm font-semibold">Your files stay confidential</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function FileField({
  label,
  onFile,
  preview,
}: {
  label: string;
  onFile: (f?: File) => void;
  preview: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label} <span className="text-muted/60 normal-case">(under 10MB)</span>
      </span>
      <div className="flex cursor-pointer items-center gap-3 rounded-xl2 border-2 border-dashed border-line bg-bg px-4 py-3.5 transition-colors hover:border-gold">
        {preview ? (
          <img src={preview} alt="preview" className="h-9 w-9 rounded-md object-cover" />
        ) : (
          <UploadCloud size={17} className="text-muted" />
        )}
        <span className="text-sm text-muted">{preview ? "File attached" : "Upload File"}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </label>
  );
}
