import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";
import Logo from "../../../public/images/favicon.jpeg";

interface NavLinkItem {
  label: string;
  to: string;
}

const LINKS: NavLinkItem[] = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Request a Quote", to: "/request-quote" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const location = useLocation();

  // Fine gold progress line tracking how far down the page the visitor is
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Close the mobile drawer automatically on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-premium ${
        scrolled
          ? "backdrop-blur-2xl backdrop-saturate-150 bg-white/55 border-b border-white/40 shadow-[0_8px_32px_-12px_rgba(24,20,16,0.18)]"
          : "bg-transparent"
      }`}
      style={{
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
      }}
    >
      {/* Hairline gold scroll-progress indicator */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-gold/0 via-gold to-gold/0"
      />

      {/* Faint top sheen so the glass reads as glass, not flat blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-60"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      <div className="container-lux relative flex items-center justify-between py-4 md:py-5">
        <Link
          to="/"
          className="group flex items-center gap-3 shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="relative flex h-11 w-11 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold/0 blur-md transition-all duration-500 group-hover:bg-gold/30" />
            <img
              src={Logo}
              alt="Prime Attaire Logo"
              className="relative h-11 w-11 rounded-full object-cover ring-1 ring-white/60 shadow-[0_2px_10px_rgba(24,20,16,0.15)] transition-transform duration-500 ease-premium group-hover:scale-105 group-hover:rotate-3"
            />
          </span>

          <span className="flex flex-col leading-none">
            <span className="font-display font-semibold tracking-[0.08em] text-sm md:text-base text-ink">
              PRIME Attaire
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.24em] text-muted uppercase">
              Custom Apparel Studio
            </span>
          </span>
        </Link>

        <nav
          className="hidden lg:flex items-center gap-1 rounded-full border border-white/50 bg-white/30 px-2 py-1.5 backdrop-blur-md"
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onMouseEnter={() => setHovered(link.to)}
              className={({ isActive }) =>
                `relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? "text-ink" : "text-muted hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>

                  {/* Sliding glass pill that glides between links on hover */}
                  {hovered === link.to && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full bg-white/70 shadow-[0_1px_6px_rgba(24,20,16,0.12)]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}

                  {/* Persistent underline dot for the active route */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/products"
            className="btn-primary group relative overflow-hidden"
            style={{ padding: "0.75rem 1.5rem", fontSize: "0.8rem" }}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Start Designing
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
            {/* Gloss sweep on hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-premium group-hover:translate-x-full" />
          </Link>
        </div>

        <button
          className="relative lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-ink backdrop-blur-md transition-transform duration-300 active:scale-90"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-white/40 bg-white/60 backdrop-blur-2xl backdrop-saturate-150"
          >
            <div className="container-lux flex flex-col gap-1 py-6">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 text-base font-medium border-b border-line/60 last:border-0 ${
                        isActive ? "text-ink" : "text-muted"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && <Sparkles size={14} className="text-gold" />}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * LINKS.length, duration: 0.35 }}
              >
                <Link
                  to="/products"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-5 w-full justify-center"
                >
                  Start Designing
                  <ArrowUpRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
