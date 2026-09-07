import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    include: { result: true },
  });

  const total = scans.length;
  const successful = scans.filter((s) => s.overallStatus === "correct").length;
  const warnings = scans.reduce((sum, s) => sum + (s.result?.warnings.length ?? 0), 0);
  const issues = scans.reduce((sum, s) => sum + (s.result?.incorrectItems.length ?? 0), 0);

  return NextResponse.json({ total, successful, warnings, issues });
}
