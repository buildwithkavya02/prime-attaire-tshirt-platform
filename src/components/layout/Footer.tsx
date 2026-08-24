import { Link } from "react-router-dom";
import { Camera, Users, AtSign, ArrowUpRight, Mail } from "lucide-react";

const columns = [
  {
    title: "Products",
    links: [
      { label: "Round Neck", to: "/products" },
      { label: "Polo Shirt", to: "/products" },
      { label: "Hoodie", to: "/products" },
      { label: "Full Sleeve", to: "/products" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Request a Quote", to: "/request-quote" },
      { label: "Browse Products", to: "/products" },
      { label: "Contact Us", to: "/contact" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "About Us", to: "/" },
      { label: "Printing Technologies", to: "/#printing" },
      { label: "Customer Gallery", to: "/#gallery" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-brown-dark text-bg overflow-hidden">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-[100px]" />
      <div className="container-lux relative py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-14">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-brown-dark font-display font-bold">
                A
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display font-semibold tracking-[0.08em] text-base">Prime Attaire</span>
                <span className="text-[10px] tracking-[0.24em] text-bg/50 uppercase">Custom Apparel Studio</span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bg/60">
              A premium custom apparel studio where every garment is designed, previewed and printed
              exactly the way you imagined it.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Camera, Users, AtSign].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-bg/15 text-bg/70 transition-all duration-300 hover:border-gold hover:text-gold hover:-translate-y-1"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{col.title}</h4>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-bg/65 transition-colors duration-300 hover:text-bg"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 rounded-xl2 border border-bg/10 bg-bg/5 px-7 py-6">
          <div>
            <p className="font-display text-lg font-semibold">Join the studio newsletter</p>
            <p className="mt-1 text-sm text-bg/55">
              New drops, print techniques and design inspiration — no spam, ever.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2 rounded-full border border-bg/15 bg-bg/5 p-1.5 pl-5"
          >
            <Mail size={16} className="text-bg/40" />
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="w-full bg-transparent text-sm text-bg placeholder:text-bg/40 outline-none"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-brown-dark transition-transform duration-300 hover:scale-105"
            >
              <ArrowUpRight size={16} />
            </button>
          </form>
        </div>

        <div className="mt-12 flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t border-bg/10 pt-8 text-xs text-bg/45">
          <p>&copy; {new Date().getFullYear()} Prime Attaire Custom Apparel Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
