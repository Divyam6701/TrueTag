"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ScanLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login, register, loginAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }

    setLoading(true);

    const result =
      mode === "login" ? await login(email, password) : await register(name, email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1d22_0%,_#0a0b0d_60%)] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <ScanLine size={18} className="text-signal" />
          <span className="font-medium tracking-tight">ScanVerify</span>
        </Link>

        <div className="bg-surface border border-line rounded-2xl p-7 shadow-card">
          <h1 className="font-display text-2xl mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted text-sm mb-6">
            {mode === "login"
              ? "Log in to continue scanning and access your history."
              : "Sign up to start verifying products with AI."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Jordan Lee"
                  className="input"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="input"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </Field>

            {mode === "login" && (
              <div className="text-right -mt-1">
                <Link href="/login/forgot" className="text-xs text-muted hover:text-paper transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

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
              {mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-line flex-1" />
            <span className="text-muted text-xs">or</span>
            <div className="h-px bg-line flex-1" />
          </div>

          <button
            onClick={async () => {
              setGuestLoading(true);
              try {
                await loginAsGuest();
                router.push("/scan");
              } catch {
                setError("Couldn't start a guest session. Please try again.");
                setGuestLoading(false);
              }
            }}
            disabled={guestLoading}
            className="w-full border border-line text-paper/90 font-medium py-3 rounded-full hover:border-muted transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {guestLoading && <Loader2 size={16} className="animate-spin" />}
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-paper underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-paper underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </motion.div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #1a1d22;
          border: 1px solid #262a30;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          color: #f4f2ec;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .input:focus {
          border-color: #4fa6d8;
        }
        .input::placeholder {
          color: #6b6f76;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
