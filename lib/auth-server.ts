import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  // Fail loudly in production rather than silently using an insecure default.
  throw new Error("AUTH_SECRET environment variable is required in production.");
}

const SECRET = JWT_SECRET || "dev-only-insecure-secret-change-me";
const TOKEN_TTL = "7d";
export const SESSION_COOKIE = "sv_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface TokenPayload {
  userId: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
