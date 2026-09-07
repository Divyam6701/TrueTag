"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, ScanLine, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductViewer } from "@/components/ProductViewer";
import { StatusCard } from "@/components/StatusCard";
import { Checklist } from "@/components/Checklist";
import { scans, downloadReportPdf } from "@/lib/store";
import type { ScanRecord } from "@/lib/types";

const OVERALL_COPY = {
  correct: { label: "Verification passed", icon: CheckCircle2, className: "text-correct" },
  warn: { label: "Passed with warnings", icon: AlertTriangle, className: "text-warn" },
  issue: { label: "Verification issues found", icon: XCircle, className: "text-issue" },
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<ScanRecord | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    scans.get(params.id).then((r) => {
      if (mounted) setRecord(r ?? null);
    });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (record === undefined) return null;

  if (!record) {
    return (
      <AppShell>
        <div className="px-6 py-20 text-center">
          <p className="text-muted mb-4">We couldn&apos;t find that scan.</p>
          <button
            onClick={() => router.push("/scan")}
            className="inline-flex items-center gap-2 bg-signal text-ink px-5 py-2.5 rounded-full text-sm font-medium"
          >
            <ScanLine size={16} /> Scan a product
          </button>
        </div>
      </AppShell>
    );
  }

  const { result } = record;
  const overall = OVERALL_COPY[result.overallStatus];
  const OverallIcon = overall.icon;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-signal text-sm font-medium mb-2">Scan result</p>
            <h1 className="font-display text-3xl">{result.product}</h1>
            <p className="text-muted text-sm mt-1">
              Report {result.scanId} · {new Date(record.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => downloadReportPdf(record.id)}
            className="inline-flex items-center gap-2 bg-paper text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors"
          >
            <Download size={16} /> Download Official PDF Notice
          </button>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-10">
          <div>
            <ProductViewer src={record.imageUrl} alt={result.product} />
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <OverallIcon size={20} className={overall.className} />
              <span className="font-medium">{overall.label}</span>
              <span className="text-muted text-sm">· {result.confidence}% overall confidence</span>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {result.correctItems.length > 0 && (
                <StatusCard status="correct" count={result.correctItems.length} delay={0} />
              )}
              {result.warnings.length > 0 && (
                <StatusCard status="warn" count={result.warnings.length} delay={0.05} />
              )}
              {result.incorrectItems.length > 0 && (
                <StatusCard status="issue" count={result.incorrectItems.length} delay={0.1} />
              )}
            </div>

            <h2 className="font-medium mb-4">Verification checklist</h2>
            <Checklist items={result.checklist} />

            <div className="flex flex-wrap gap-3 mt-10">
              <button
                onClick={() => router.push("/scan")}
                className="inline-flex items-center gap-2 bg-signal text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition-all"
              >
                <ScanLine size={16} /> Scan Another Product
              </button>
              <button
                onClick={() => router.push("/history")}
                className="inline-flex items-center gap-2 border border-line px-5 py-2.5 rounded-full text-sm font-medium hover:border-muted transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
