"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Lock, ShieldCheck, Eye, EyeSlash, Warning, CheckCircle, ArrowRight,
} from "@phosphor-icons/react";
import { saveSession, signOut } from "@/lib/auth";
import { api } from "@/lib/api";

const SPRING = { type: "spring", stiffness: 110, damping: 22 };

function strengthScore(password) {
  let s = 0;
  if (password.length >= 8)  s++;
  if (password.length >= 12) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_TONES  = [
  "bg-zinc-300",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-600",
];

export default function ForcedPasswordChange({ user, onComplete }) {
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");

  const score    = useMemo(() => strengthScore(newPwd), [newPwd]);
  const matches  = newPwd && confirm && newPwd === confirm;
  const tooShort = newPwd.length > 0 && newPwd.length < 8;
  const sameAsAdmin = newPwd === "admin";
  const canSubmit = newPwd.length >= 8 && matches && !sameAsAdmin && !busy;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setBusy(true);
    setErr("");
    try {
      // First-login flow: send the user's current password (admin/admin) so
      // the backend can verify even though must_change_password short-circuits it.
      const result = await api.post("changePassword", {
        currentPassword: "",   // backend allows empty when mustChangePassword=true
        newPassword:     newPwd,
      });
      saveSession({ token: result.token, user: result.user });
      onComplete(result.user);
    } catch (ex) {
      setErr(ex.message || "Failed to set password.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] font-sans bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="w-full max-w-md"
      >
        {/* Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_8px_24px_-4px_rgba(16,185,129,0.4)] mb-4">
            <ShieldCheck size={26} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Set a new password</h1>
          <p className="mt-2 text-[13px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Welcome, {user.name}. Choose a strong password before you continue — this replaces your default credentials.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/10 rounded-3xl p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
        >
          {/* New password */}
          <label className="block">
            <span className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2 inline-block">New password</span>
            <div className="relative">
              <Lock size={15} weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPwd ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                disabled={busy}
                autoFocus
                placeholder="At least 8 characters"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:ring-emerald-500/60 transition"
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 transition"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeSlash size={16} weight="duotone" /> : <Eye size={16} weight="duotone" />}
              </button>
            </div>
          </label>

          {/* Strength meter */}
          {newPwd.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i < score ? STRENGTH_TONES[score] : "bg-zinc-800"}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-mono text-zinc-500">{STRENGTH_LABELS[score]}</span>
                {tooShort && <span className="text-[11px] text-amber-400">Min 8 characters</span>}
                {sameAsAdmin && <span className="text-[11px] text-rose-400">Cannot reuse default</span>}
              </div>
            </div>
          )}

          {/* Confirm */}
          <label className="block mt-5">
            <span className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2 inline-block">Confirm password</span>
            <div className="relative">
              <Lock size={15} weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                placeholder="Repeat the password"
                className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-zinc-950/40 ring-1 text-white text-[14px] placeholder:text-zinc-600 focus:outline-none transition ${
                  confirm.length > 0 && !matches
                    ? "ring-rose-500/40 focus:ring-rose-500/60"
                    : matches
                    ? "ring-emerald-500/30 focus:ring-emerald-500/60"
                    : "ring-white/10 focus:ring-emerald-500/60"
                }`}
              />
              {matches && (
                <CheckCircle size={16} weight="duotone" className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
              )}
            </div>
            {confirm.length > 0 && !matches && (
              <span className="text-[11px] text-rose-400 mt-1.5 inline-block">Passwords don&rsquo;t match</span>
            )}
          </label>

          {err && (
            <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-rose-500/10 ring-1 ring-rose-500/30 flex items-start gap-2.5">
              <Warning size={14} weight="duotone" className="text-rose-400 mt-0.5 flex-shrink-0" />
              <span className="text-[12.5px] text-rose-300">{err}</span>
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { y: -1 } : {}}
            whileTap={canSubmit ? { scale: 0.985 } : {}}
            transition={SPRING}
            className={`group mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[13.5px] font-semibold transition active:translate-y-[1px] ${
              canSubmit
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.5)]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {busy ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Saving&hellip;</span>
              </>
            ) : (
              <>
                <span>Set password and continue</span>
                <ArrowRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </motion.button>

          {/* Sign out */}
          <button
            type="button"
            onClick={() => { signOut(); onComplete(null); }}
            className="mt-4 w-full text-center text-[11.5px] text-zinc-500 hover:text-zinc-300 transition"
          >
            Cancel and sign out
          </button>
        </form>
      </motion.div>
    </div>
  );
}
