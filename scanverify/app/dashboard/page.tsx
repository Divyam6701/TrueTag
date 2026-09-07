"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScanText, Upload, History, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { scans, fetchDashboardStats } from "@/lib/store";
import type { ScanRecord } from "@/lib/types";

interface Stats {
  total: number;
  successful: number;
  warnings: number;
  issues: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, ready } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, successful: 0, warnings: 0, issues: 0 });

  useEffect(() => {
    if (ready && session) {
      scans.list().then((list) => setRecords(list.slice(0, 5)));
      fetchDashboardStats().then(setStats);
    }
  }, [ready, session]);

  const recent = records;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-signal text-sm font-medium mb-2">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-3xl">
            {session ? `Welcome back, ${session.name.split(" ")[0]}` : "Welcome back"}
          </h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatTile label="Total scans" value={stats.total} />
          <StatTile label="Successful" value={stats.successful} accent="text-correct" />
          <StatTile label="Warnings" value={stats.warnings} accent="text-warn" />
          <StatTile label="Issues detected" value={stats.issues} accent="text-issue" />
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          <QuickAction
            icon={<ScanText size={16} />}
            label="Scan Product"
            emphasized
            onClick={() => router.push("/scan")}
          />
          <QuickAction
            icon={<Upload size={16} />}
            label="Upload Product"
            onClick={() => router.push("/scan")}
          />
          <QuickAction
            icon={<History size={16} />}
            label="View History"
            onClick={() => router.push("/history")}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Recent scans</h2>
          {recent.length > 0 && (
            <button onClick={() => router.push("/history")} className="text-sm text-muted hover:text-paper">
              View all
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-line rounded-3xl">
            <p className="text-muted mb-6">You haven&apos;t scanned anything yet.</p>
            <button
              onClick={() => router.push("/scan")}
              className="inline-flex items-center gap-2 bg-signal text-ink px-5 py-2.5 rounded-full text-sm font-medium"
            >
              <ScanText size={16} /> Scan your first product
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recent.map((record, i) => {
              const Icon =
                record.result.overallStatus === "correct"
                  ? CheckCircle2
                  : record.result.overallStatus === "warn"
                  ? AlertTriangle
                  : XCircle;
              const color =
                record.result.overallStatus === "correct"
                  ? "text-correct"
                  : record.result.overallStatus === "warn"
                  ? "text-warn"
                  : "text-issue";
              return (
                <motion.button
                  key={record.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/results/${record.id}`)}
                  className="flex items-center gap-3 border border-line rounded-2xl p-3.5 bg-surface/40 hover:bg-surface2/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface2 border border-line shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={13} className={color} />
                      <span className="text-sm font-medium truncate">{record.result.product}</span>
                    </div>
                    <p className="text-muted text-xs">{new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="border border-line rounded-2xl p-5 bg-surface/40">
      <p className={`font-display text-3xl mb-1 ${accent ?? ""}`}>{value}</p>
      <p className="text-muted text-xs">{label}</p>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  emphasized,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  emphasized?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        emphasized
          ? "bg-signal text-ink hover:brightness-110"
          : "border border-line hover:border-muted"
      }`}
    >
      {icon} {label}
    </button>
  );
}
