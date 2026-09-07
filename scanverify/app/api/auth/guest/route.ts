import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth-server";
import { setSessionCookie } from "@/lib/cookies";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(clientKeyFromRequest(req, "guest"), 20, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const suffix = nanoid(10);
  const passwordHash = await hashPassword(nanoid(32));

  const user = await prisma.user.create({
    data: {
      name: "Guest",
      email: `guest-${suffix}@scanverify.local`,
      passwordHash,
      isGuest: true,
    },
    select: { id: true, name: true, email: true },
  });

  setSessionCookie(signToken({ userId: user.id }));

  return NextResponse.json({ user });
}
