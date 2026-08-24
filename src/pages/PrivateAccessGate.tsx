import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Lock, ShieldAlert, TimerOff, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import { validateDesignToken, verifyAccessCode } from "../lib/api";
import type { Project } from "../types/admin";
import PrivateStudio from "./PrivateStudio";

type GateState =
  | { phase: "checking" }
  | { phase: "needs_code"; projectName: string }
  | { phase: "invalid" }
  | { phase: "expired" }
  | { phase: "revoked" }
  | { phase: "ready"; project: Project };

export default function PrivateAccessGate() {
  const { token = "" } = useParams();
  const [state, setState] = useState<GateState>({ phase: "checking" });
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let active = true;
    validateDesignToken(token).then((result) => {
      if (!active) return;
      if (result.status === "ok") setState({ phase: "ready", project: result.project });
      else if (result.status === "needs_code") setState({ phase: "needs_code", projectName: result.projectName });
      else setState({ phase: result.status });
    });
    return () => {
      active = false;
    };
  }, [token]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    const result = await verifyAccessCode(token, code.trim());
    setVerifying(false);
    if (result.status === "ok") {
      setState({ phase: "ready", project: result.project });
    } else if (result.status === "needs_code") {
      toast.error("Incorrect access code. Please try again.");
    } else {
      setState({ phase: result.status });
    }
  };

  if (state.phase === "ready") {
    return <PrivateStudio project={state.project} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brown-dark px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl3 border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-md"
      >
        {state.phase === "checking" && (
          <>
            <Loader2 className="mx-auto animate-spin text-gold" size={28} />
            <p className="mt-4 text-sm text-bg/60">Checking your private design link…</p>
          </>
        )}

        {state.phase === "needs_code" && (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Lock size={20} />
            </span>
            <h1 className="mt-5 font-display text-xl font-semibold text-bg">Private Design Access</h1>
            <p className="mt-2 text-sm text-bg/60">
              Your private customization project — <span className="text-gold">{state.projectName}</span> —
              is ready.
            </p>
            <form onSubmit={handleContinue} className="mt-6 space-y-4">
              <input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access Code"
                className="w-full rounded-full border border-white/15 bg-white/5 py-3.5 text-center text-lg tracking-[0.3em] text-bg placeholder:tracking-normal placeholder:text-bg/40 outline-none transition-colors focus:border-gold"
              />
              <button
                type="submit"
                disabled={verifying || !code.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-sm font-semibold text-brown-dark transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
              >
                {verifying && <Loader2 size={15} className="animate-spin" />}
                Continue
              </button>
            </form>
          </>
        )}

        {state.phase === "invalid" && (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <ShieldAlert size={20} />
            </span>
            <h1 className="mt-5 font-display text-xl font-semibold text-bg">Link Not Found</h1>
            <p className="mt-2 text-sm text-bg/60">
              This private design link is invalid or no longer available.
            </p>
          </>
        )}

        {state.phase === "expired" && (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <TimerOff size={20} />
            </span>
            <h1 className="mt-5 font-display text-xl font-semibold text-bg">Link Expired</h1>
            <p className="mt-2 text-sm text-bg/60">
              This private design link has expired. Please contact Prime Attaire.
            </p>
          </>
        )}

        {state.phase === "revoked" && (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <ShieldOff size={20} />
            </span>
            <h1 className="mt-5 font-display text-xl font-semibold text-bg">Link No Longer Active</h1>
            <p className="mt-2 text-sm text-bg/60">This private design link is no longer active.</p>
          </>
        )}

        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-bg/30">
          Private project · Access provided by Prime Attaire
        </p>
      </motion.div>
    </div>
  );
}
