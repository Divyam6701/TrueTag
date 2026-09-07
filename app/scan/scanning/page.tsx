"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PIPELINE_STAGES } from "@/lib/mockAI";
import { scans } from "@/lib/store";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const DETECTION_BOXES = [
  { top: "12%", left: "18%", width: "30%", height: "14%" },
  { top: "58%", left: "10%", width: "24%", height: "12%" },
  { top: "40%", left: "55%", width: "32%", height: "18%" },
];

const MIN_STAGE_MS = 650;

export default function ScanningPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const pending = sessionStorage.getItem("scanverify:pending-image");
    if (!pending) {
      router.replace("/scan");
      return;
    }
    setImage(pending);
  }, [router]);

  useEffect(() => {
    if (!image || started.current) return;
    started.current = true;

    let cancelled = false;
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, PIPELINE_STAGES.length - 1));
    }, MIN_STAGE_MS);

    async function run() {
      try {
        const [blob] = await Promise.all([
          fetch(image!).then((r) => r.blob()),
          new Promise((r) => setTimeout(r, PIPELINE_STAGES.length * MIN_STAGE_MS + 300)),
        ]);

        const result = await scans.create(blob);
        if (cancelled) return;

        if (!result.ok) {
          setError(result.error);
          return;
        }

        sessionStorage.removeItem("scanverify:pending-image");
        router.replace(`/results/${result.record.id}`);
      } catch {
        if (!cancelled) {
          setError("Something went wrong while analyzing your image. Please try again.");
        }
      }
    }
    run();

    return () => {
      cancelled = true;
      clearInterval(stageTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  if (!image) return null;

  if (error) {
    return (
      <AppShell>
        <div className="px-6 py-24 max-w-md mx-auto text-center">
          <AlertTriangle size={28} className="mx-auto text-issue mb-4" />
          <p className="text-paper mb-2 font-medium">Scan failed</p>
          <p className="text-muted text-sm mb-8">{error}</p>
          <button
            onClick={() => {
              sessionStorage.removeItem("scanverify:pending-image");
              router.push("/scan");
            }}
            className="inline-flex items-center gap-2 bg-signal text-ink px-5 py-2.5 rounded-full text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-signal text-sm font-medium mb-2">Analyzing</p>
          <h1 className="font-display text-3xl">Running AI verification</h1>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-line bg-surface aspect-[4/3] mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Product being scanned" className="w-full h-full object-contain bg-surface2" />

          <motion.div
            className="absolute left-0 right-0 h-14 bg-gradient-to-b from-signal/0 via-signal/40 to-signal/0"
            animate={{ top: ["0%", "92%", "0%"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {DETECTION_BOXES.map((box, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: stageIndex >= i + 1 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="absolute border border-signal/70 rounded-sm"
              style={box}
            >
              <span className="absolute -top-5 left-0 text-[9px] font-mono text-signal bg-ink/80 px-1 rounded">
                {stageIndex >= i + 1 ? "detected" : ""}
              </span>
            </motion.div>
          ))}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = i < stageIndex;
            const active = i === stageIndex;
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: i <= stageIndex ? 1 : 0.3 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                    done
                      ? "bg-correct border-correct text-ink"
                      : active
                      ? "border-signal"
                      : "border-line"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 size={13} />
                  ) : active ? (
                    <span className="w-2 h-2 rounded-full bg-signal animate-pulseSoft" />
                  ) : null}
                </span>
                <span className={`text-sm ${done || active ? "text-paper" : "text-muted"}`}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
