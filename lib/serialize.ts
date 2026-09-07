import "server-only";
import type { Scan, ScanResult, ChecklistItem } from "@prisma/client";

type FullScan = Scan & { result: ScanResult | null; checklistItems: ChecklistItem[] };

export function serializeScan(scan: FullScan) {
  return {
    id: scan.id,
    userId: scan.userId,
    imageUrl: scan.imageUrl,
    createdAt: scan.createdAt.toISOString(),
    result: {
      scanId: scan.id,
      product: scan.detectedProduct,
      overallStatus: scan.overallStatus,
      correctItems: scan.result?.correctItems ?? [],
      incorrectItems: scan.result?.incorrectItems ?? [],
      warnings: scan.result?.warnings ?? [],
      checklist: scan.checklistItems.map((item) => ({
        id: item.id,
        label: item.label,
        detail: item.detail,
        status: item.status,
        confidence: item.confidence,
      })),
      confidence: scan.confidence,
      createdAt: scan.createdAt.toISOString(),
    },
  };
}
