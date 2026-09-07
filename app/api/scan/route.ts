import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { storeImage, UploadValidationError } from "@/lib/upload";
import { analyzeProduct } from "@/lib/mockAI";
import { serializeScan } from "@/lib/serialize";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const limited = rateLimit(`user:${user.id}:scan`, 20, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "You're scanning too quickly. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  let imageUrl: string;
  let analysisBuffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    analysisBuffer = Buffer.from(arrayBuffer);
    imageUrl = await storeImage(file);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "We couldn't process that image. Please try another file." }, { status: 500 });
  }

  const analysis = await analyzeProduct(analysisBuffer);

  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      imageUrl,
      detectedProduct: analysis.product,
      overallStatus: analysis.overallStatus,
      confidence: analysis.confidence,
      result: {
        create: {
          correctItems: analysis.correctItems,
          incorrectItems: analysis.incorrectItems,
          warnings: analysis.warnings,
        },
      },
      checklistItems: {
        create: analysis.checklist.map((item) => ({
          label: item.label,
          detail: item.detail,
          status: item.status,
          confidence: item.confidence,
        })),
      },
    },
    include: { result: true, checklistItems: true },
  });

  return NextResponse.json(serializeScan(scan), { status: 201 });
}
