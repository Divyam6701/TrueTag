import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifyToken } from "./auth-server";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });

  return user;
}

/**
 * Discriminated-union helper for route handlers, so TypeScript can
 * actually narrow the result instead of leaving `response` typed as
 * `Response | null`:
 *
 *   const auth = await requireUser();
 *   if (!auth.ok) return auth.response;
 *   const user = auth.user; // narrowed to SessionUser
 */
export type RequireUserResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

export async function requireUser(): Promise<RequireUserResult> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Not authenticated." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { ok: true, user };
}
