"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, LucideIcon } from "lucide-react";
import type { Verdict } from "@/lib/types";

const CONFIG: Record<
  Verdict,
  { icon: LucideIcon; title: string; description: string; text: string; bg: string; border: string }
> = {
  correct: {
    icon: CheckCircle2,
    title: "Correct",
    description: "Everything detected here meets the required criteria.",
    text: "text-correct",
    bg: "bg-correctSoft",
    border: "border-correct/30",
  },
  issue: {
    icon: XCircle,
    title: "Something is wrong",
    description: "Potential issues were detected and require attention.",
    text: "text-issue",
    bg: "bg-issueSoft",
    border: "border-issue/30",
  },
  warn: {
    icon: AlertTriangle,
    title: "Warning",
    description: "Some items require review or additional verification.",
    text: "text-warn",
    bg: "bg-warnSoft",
    border: "border-warn/30",
  },
};

export function StatusCard({ status, count, delay = 0 }: { status: Verdict; count: number; delay?: number }) {
  const c = CONFIG[status];
  const Icon = c.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border ${c.border} ${c.bg} p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon size={20} className={c.text} />
        <span className={`text-2xl font-display ${c.text}`}>{count}</span>
      </div>
      <h3 className="font-medium mb-1">{c.title}</h3>
      <p className="text-muted text-sm leading-relaxed">{c.description}</p>
    </motion.div>
  );
}
