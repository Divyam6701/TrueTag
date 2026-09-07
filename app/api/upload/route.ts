import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { storeImage, UploadValidationError } from "@/lib/upload";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  const limited = rateLimit(clientKeyFromRequest(req, "upload"), 30, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many uploads. Please slow down." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  try {
    const url = await storeImage(file);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "We couldn't process that image." }, { status: 500 });
  }
}
