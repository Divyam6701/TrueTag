import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { generateReportPdfBuffer } from "@/lib/pdf-server";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const scan = await prisma.scan.findUnique({
    where: { id: params.id },
    include: { result: true, checklistItems: true },
  });

  if (!scan || scan.userId !== user.id) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  const pdfBytes = await generateReportPdfBuffer({
    scanId: scan.id,
    product: scan.detectedProduct,
    overallStatus: scan.overallStatus,
    correctItems: scan.result?.correctItems ?? [],
    incorrectItems: scan.result?.incorrectItems ?? [],
    warnings: scan.result?.warnings ?? [],
    checklist: scan.checklistItems.map((item) => ({
      label: item.label,
      detail: item.detail,
      status: item.status,
      confidence: item.confidence,
    })),
    confidence: scan.confidence,
    createdAt: scan.createdAt,
    imageUrl: scan.imageUrl,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="scanverify-report-${scan.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
