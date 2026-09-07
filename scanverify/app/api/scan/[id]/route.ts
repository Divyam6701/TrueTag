import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { serializeScan } from "@/lib/serialize";

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

  return NextResponse.json(serializeScan(scan));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const scan = await prisma.scan.findUnique({ where: { id: params.id } });
  if (!scan || scan.userId !== user.id) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  await prisma.scan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
