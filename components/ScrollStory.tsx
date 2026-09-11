"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ProductRig } from "./ProductRig";
import { CheckCircle2, AlertTriangle, XCircle, ScanLine } from "lucide-react";

function useStageOpacity(progress: MotionValue<number>, start: number, end: number, fadeOut = 0.06) {
  return useTransform(
    progress,
    [start, start + fadeOut, end - fadeOut, end],
    [0, 1, 1, 0]
  );
}

const DATA_TAGS = [
  { x: "8%", y: "20%", label: "PRODUCT NAME" },
  { x: "78%", y: "18%", label: "NET WEIGHT" },
  { x: "6%", y: "55%", label: "BATCH CODE" },
  { x: "80%", y: "58%", label: "INGREDIENTS" },
  { x: "10%", y: "82%", label: "SEAL STATUS" },
];

export function ZoomStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const s1 = useStageOpacity(scrollYProgress, 0, 0.2);
  const s2 = useStageOpacity(scrollYProgress, 0.2, 0.42);
  const s3 = useStageOpacity(scrollYProgress, 0.42, 0.64);
  const s4 = useStageOpacity(scrollYProgress, 0.64, 0.84);
  const s5 = useStageOpacity(scrollYProgress, 0.84, 1, 0.05);

  const rigScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const rigX = useTransform(scrollYProgress, [0.82, 1], ["0%", "-16%"]);

  return (
    <div ref={trackRef} className="relative h-[520vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#131519_0%,_#0a0b0d_70%)]" />

        <motion.div
          style={{ scale: rigScale, x: rigX }}
          className="relative w-[min(70vw,520px)]"
        >
          <ProductRig className="w-full h-auto" />

          {/* Stage 2: scanning beam + bounding box */}
          <motion.div style={{ opacity: s2 }} className="absolute inset-0">
            <div className="absolute left-[38%] right-[38%] top-[34%] bottom-[16%] border border-signal/70 rounded-sm" />
            <motion.div
              className="absolute left-[36%] right-[36%] top-0 h-10 bg-gradient-to-b from-signal/0 via-signal/60 to-signal/0"
              animate={{ y: ["10%", "85%", "10%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Stage 3: data extraction tags */}
          <motion.div style={{ opacity: s3 }} className="absolute inset-0">
            {DATA_TAGS.map((tag, i) => (
              <motion.div
                key={tag.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="absolute font-mono text-[10px] tracking-wide text-signal bg-signalSoft/70 border border-signal/30 rounded px-2 py-1 whitespace-nowrap"
                style={{ left: tag.x, top: tag.y }}
              >
                {tag.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Stage 4: verification badges */}
          <motion.div style={{ opacity: s4 }} className="absolute inset-0">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute left-[4%] top-[30%] flex items-center gap-1.5 bg-correctSoft border border-correct/40 text-correct text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              <CheckCircle2 size={13} /> Correct
            </motion.div>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="absolute right-[2%] top-[48%] flex items-center gap-1.5 bg-warnSoft border border-warn/40 text-warn text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              <AlertTriangle size={13} /> Warning
            </motion.div>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute left-[8%] bottom-[10%] flex items-center gap-1.5 bg-issueSoft border border-issue/40 text-issue text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              <XCircle size={13} /> Something is wrong
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stage 5: result panel sliding in */}
        <motion.div
          style={{ opacity: s5 }}
          className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[280px] bg-surface border border-line rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 text-correct text-sm font-medium mb-3">
            <CheckCircle2 size={16} /> Analysis complete
          </div>
          <div className="space-y-2">
            {["Product name detected", "Label readable", "Packaging verified"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={12} className="text-correct shrink-0" /> {t}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-muted">
              <AlertTriangle size={12} className="text-warn shrink-0" /> Additional verification required
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line text-[11px] text-muted">
            Report ready to download
          </div>
        </motion.div>

        {/* Stage text captions */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-14 w-full px-6 text-center pointer-events-none">
          <StageCaption opacity={s1} icon={<ScanLine size={14} />} eyebrow="Step 1">
            Start with a product.
          </StageCaption>
          <StageCaption opacity={s2} icon={<ScanLine size={14} />} eyebrow="Step 2">
            Capture the details.
          </StageCaption>
          <StageCaption opacity={s3} icon={<ScanLine size={14} />} eyebrow="Step 3">
            AI analyzes every detail.
          </StageCaption>
          <StageCaption opacity={s4} icon={<ScanLine size={14} />} eyebrow="Step 4">
            Correct, wrong, or worth a second look — labeled clearly.
          </StageCaption>
          <StageCaption opacity={s5} icon={<ScanLine size={14} />} eyebrow="Step 5">
            Your answer. Clearly presented.
          </StageCaption>
        </div>
      </div>
    </div>
  );
}

function StageCaption({
  opacity,
  children,
}: {
  opacity: MotionValue<number>;
  icon: React.ReactNode;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <motion.p
      style={{ opacity, position: "absolute", left: 0, right: 0 }}
      className="font-display text-2xl md:text-3xl text-paper"
    >
      {children}
    </motion.p>
  );
}
