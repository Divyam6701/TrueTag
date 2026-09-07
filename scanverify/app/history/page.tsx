"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, CheckCircle2, AlertTriangle, XCircle, ScanText, Inbox } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { scans, downloadReportPdf } from "@/lib/store";
import type { ScanRecord, Verdict } from "@/lib/types";

const STATUS_ICON: Record<Verdict, typeof CheckCircle2> = {
  correct: CheckCircle2,
  warn: AlertTriangle,
  issue: XCircle,
};
const STATUS_COLOR: Record<Verdict, string> = {
  correct: "text-correct",
  warn: "text-warn",
  issue: "text-issue",
};

type SortKey = "newest" | "oldest" | "product";
type FilterKey = "all" | Verdict;

export default function HistoryPage() {
  const router = useRouter();
  const { session, ready } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    if (ready && session) {
      scans.list().then(setRecords);
    }
  }, [ready, session]);

  const visible = useMemo(() => {
    let list = [...records];
    if (filter !== "all") list = list.filter((r) => r.result.overallStatus === filter);
    if (sort === "newest") list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "oldest") list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    if (sort === "product") list.sort((a, b) => a.result.product.localeCompare(b.result.product));
    return list;
  }, [records, sort, filter]);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-signal text-sm font-medium mb-2">Your scans</p>
            <h1 className="font-display text-3xl">History</h1>
          </div>
          <button
            onClick={() => router.push("/scan")}
            className="inline-flex items-center gap-2 bg-signal text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition-all"
          >
            <ScanText size={16} /> Scan Another Product
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(["all", "correct", "warn", "issue"] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-surface2 border-muted text-paper"
                  : "border-line text-muted hover:text-paper"
              }`}
            >
              {f === "all" ? "All" : f === "correct" ? "Correct" : f === "warn" ? "Warnings" : "Issues"}
            </button>
          ))}
          <div className="flex-1" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-surface border border-line rounded-full text-xs px-3 py-1.5 text-muted outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="product">Product name</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-line rounded-3xl">
            <Inbox size={28} className="mx-auto text-muted mb-4" />
            <p className="text-muted mb-6">No scans yet.</p>
            <button
              onClick={() => router.push("/scan")}
              className="inline-flex items-center gap-2 bg-paper text-ink px-5 py-2.5 rounded-full text-sm font-medium"
            >
              Scan your first product
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((record, i) => {
              const Icon = STATUS_ICON[record.result.overallStatus];
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="flex items-center gap-4 border border-line rounded-2xl p-3.5 bg-surface/40 hover:bg-surface2/50 transition-colors"
                >
                  <button
                    onClick={() => router.push(`/results/${record.id}`)}
                    className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-surface2 border border-line"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={record.imageUrl}
                      alt={record.result.product}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <button
                    onClick={() => router.push(`/results/${record.id}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className={STATUS_COLOR[record.result.overallStatus]} />
                      <span className="font-medium text-sm truncate">{record.result.product}</span>
                    </div>
                    <p className="text-muted text-xs truncate">
                      {new Date(record.createdAt).toLocaleDateString()} · Report {record.id} ·{" "}
                      {record.result.warnings.length} warnings · {record.result.incorrectItems.length} issues
                    </p>
                  </button>

                  <button
                    onClick={() => downloadReportPdf(record.id)}
                    title="Download PDF"
                    className="shrink-0 w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-muted transition-colors"
                  >
                    <Download size={15} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
