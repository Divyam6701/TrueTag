import "server-only";
import sharp from "sharp";

/**
 * IMAGE STORAGE
 * -------------------------------------------------------------
 * Images are optimized and stored as base64 data URLs directly in
 * Postgres (the `Scan.imageUrl` column). This is a deliberate choice:
 * it means the app needs nothing beyond a Postgres database to deploy
 * and run correctly on serverless hosts (Vercel, etc.) — there's no
 * writable disk to lose, and no Cloudinary/S3 account required before
 * you can see it live.
 *
 * The tradeoff is database size: every scan's image lives in the
 * `Scan` row. That's fine at demo/moderate scale (images are capped at
 * 1600px and re-encoded as JPEG, typically 80–250KB). For high-volume
 * production use, swap the body of `storeImage` below for an upload to
 * Cloudinary or an S3-compatible bucket (credentials already scaffolded
 * in .env.example) and return that provider's public URL instead of a
 * data URL — nothing else in the app needs to change, since callers
 * just treat the return value as an <img src>-compatible string.
 */

export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export class UploadValidationError extends Error {}

export async function storeImage(file: File): Promise<string> {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    throw new UploadValidationError("Unsupported file type. Please upload a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("File is too large. Maximum size is 10MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Re-encode and cap dimensions server-side: this both optimizes the
  // stored size and strips any embedded scripts/metadata from the
  // original upload, rather than trusting the client-provided bytes.
  const optimized = await sharp(inputBuffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  return `data:image/jpeg;base64,${optimized.toString("base64")}`;
}
