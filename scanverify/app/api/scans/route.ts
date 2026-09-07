import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { serializeScan } from "@/lib/serialize";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    include: { result: true, checklistItems: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ scans: scans.map(serializeScan) });
}
