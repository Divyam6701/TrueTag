"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown } from "lucide-react";
import type { ChecklistItem, Verdict } from "@/lib/types";

const ICON: Record<Verdict, typeof CheckCircle2> = {
  correct: CheckCircle2,
  warn: AlertTriangle,
  issue: XCircle,
};

const COLOR: Record<Verdict, string> = {
  correct: "text-correct",
  warn: "text-warn",
  issue: "text-issue",
};

export function Checklist({ items }: { items: ChecklistItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-line border border-line rounded-2xl overflow-hidden bg-surface/40">
      {items.map((item) => {
        const Icon = ICON[item.status];
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface2/50 transition-colors"
            >
              <Icon size={18} className={`shrink-0 ${COLOR[item.status]}`} />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted hidden sm:inline">{item.confidence}%</span>
              <ChevronDown
                size={15}
                className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pl-11 text-sm text-muted leading-relaxed">
                    {item.detail}
                    <div className="mt-2 text-xs text-muted/70 sm:hidden">
                      Confidence: {item.confidence}%
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
