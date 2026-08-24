import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const { loggedIn, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loggedIn) {
    const from = (location.state as { from?: string })?.from || "/admin";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) {
      navigate("/admin", { replace: true });
    } else {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brown-dark px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-xl3 border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-brown-dark font-display text-lg font-bold">
            A
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-bg">Admin Sign In</h1>
          <p className="mt-1 text-xs text-bg/50">Prime Attaire — Private Studio Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-bg/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-bg placeholder:text-bg/40 outline-none transition-colors focus:border-gold"
            />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-bg/40" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-bg placeholder:text-bg/40 outline-none transition-colors focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-sm font-semibold text-brown-dark transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-bg/35">
          Contact your administrator if you don't have login credentials.
        </p>
      </motion.div>
    </div>
  );
}
