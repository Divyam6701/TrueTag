"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScanLine, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1d22_0%,_#0a0b0d_60%)] -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <ScanLine size={18} className="text-signal" />
          <span className="font-medium tracking-tight">ScanVerify</span>
        </Link>

        <div className="bg-surface border border-line rounded-2xl p-7 shadow-card">
          {sent ? (
            <>
              <h1 className="font-display text-2xl mb-2">Check your email</h1>
              <p className="text-muted text-sm mb-6">
                If an account exists for {email}, we&apos;ve sent a link to reset your
                password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-paper underline"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl mb-1">Reset your password</h1>
              <p className="text-muted text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="block text-xs text-muted mb-1.5">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-surface2 border border-line rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-signal transition-colors"
                  />
                </label>
                {error && (
                  <p className="text-issue text-sm bg-issueSoft border border-issue/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-paper text-ink font-medium py-3 rounded-full hover:bg-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Send reset link
                </button>
              </form>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper mt-5 transition-colors"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
