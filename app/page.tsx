"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ScanLine, ShieldCheck, FileCheck2 } from "lucide-react";
import { ZoomStory } from "@/components/ZoomStory";
import { ProductRig } from "@/components/ProductRig";
import { useAuth } from "@/hooks/useAuth";

export default function WelcomePage() {
  const router = useRouter();
  const { loginAsGuest } = useAuth();

  async function handleGuestContinue() {
    try {
      await loginAsGuest();
      router.push("/scan");
    } catch {
      router.push("/signup");
    }
  }

  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <BackgroundField />

        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-signal" />
            <span className="font-medium tracking-tight">TrueTag</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-muted hover:text-paper transition-colors px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-paper text-ink px-4 py-2 rounded-full font-medium hover:bg-white transition-colors"
            >
              Sign up
            </Link>
          </nav>
        </header>

        <div className="relative z-10 flex-1 grid md:grid-cols-2 items-center gap-10 px-6 md:px-10 max-w-6xl mx-auto w-full">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-signal text-sm font-medium mb-4"
            >
              AI-powered product verification
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-5xl md:text-6xl leading-[1.05] mb-6"
            >
              Scan. Verify.
              <br />
              <span className="italic text-muted">Know.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-muted text-lg max-w-md mb-9"
            >
              Use AI-powered visual analysis to instantly verify products,
              identify issues, and generate an official report.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-signal text-ink px-6 py-3.5 rounded-full font-medium hover:brightness-110 transition-all"
              >
                Scan a Product
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="text-paper/90 hover:text-paper px-4 py-3.5 text-sm font-medium border border-line rounded-full hover:border-muted transition-colors"
              >
                Learn more
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <ProductRig className="w-full h-auto drop-shadow-[0_0_60px_rgba(79,166,216,0.15)]" />
          </motion.div>
        </div>

        <div className="relative z-10 flex justify-center pb-8 text-muted text-xs tracking-wide">
           see how it works below
        </div>
      </section>

      {/* SCROLL STORY */}
      <section id="how-it-works">
        < ZoomStory />
      </section>

      {/* TRUST STRIP */}
      <section className="px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            icon={<ScanLine size={20} className="text-signal" />}
            title="Point, capture, done"
            body="Upload a photo or use your camera. The pipeline handles detection, extraction, and analysis automatically."
          />
          <Feature
            icon={<ShieldCheck size={20} className="text-signal" />}
            title="Clear, honest verdicts"
            body="Every finding is labeled correct, warning, or issue — never buried in a wall of raw data."
          />
          <Feature
            icon={<FileCheck2 size={20} className="text-signal" />}
            title="An official record"
            body="Download a structured PDF notice for every scan, and revisit any past result from your history."
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-10 py-28 text-center border-t border-line">
        <h2 className="font-display text-3xl md:text-4xl mb-6 max-w-xl mx-auto">
          Ready to see what your product is really telling you?
        </h2>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
        >
          Scan a Product
          <ArrowRight size={16} />
        </Link>
        <p className="text-muted text-xs mt-6">
          No account? You can also{" "}
          <button onClick={handleGuestContinue} className="underline hover:text-paper">
            continue as a guest
          </button>
          .
        </p>
      </section>

      <footer className="px-6 md:px-10 py-8 text-center text-muted text-xs border-t border-line">
        TrueTag — AI product scanning &amp; verification.
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-line rounded-2xl p-6 bg-surface/40">
      <div className="mb-4">{icon}</div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function BackgroundField() {
  return (
    <div className="absolute inset-0 -z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1d22_0%,_#0a0b0d_60%)]" />
      <motion.div
        className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-signal/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-correct/5 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8D9199" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
