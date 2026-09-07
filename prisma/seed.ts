/**
 * Seed script: creates a demo account with a few sample scans so the
 * dashboard/history pages aren't empty on first run.
 *
 * Run with: npm run db:seed
 * (executed automatically by `npx prisma migrate dev` too, since
 * package.json declares it under the "prisma.seed" key)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@scanverify.local";
const DEMO_PASSWORD = "password123";

const SAMPLE_SCANS = [
  {
    detectedProduct: "Packaged Snack Product",
    overallStatus: "correct" as const,
    confidence: 94,
    correctItems: [
      "Product name detected",
      "Required information present",
      "Label readability",
      "Packaging integrity",
      "Ingredient / material listing",
      "Authenticity markers",
      "Expiry / batch code visibility",
    ],
    incorrectItems: [] as string[],
    warnings: [] as string[],
    checklist: [
      { label: "Product name detected", detail: "A clear, legible product name was located on the primary label.", status: "correct" as const, confidence: 96 },
      { label: "Required information present", detail: "Mandatory disclosure fields were all found.", status: "correct" as const, confidence: 93 },
      { label: "Label readability", detail: "Text contrast and resolution were sufficient for reliable OCR extraction.", status: "correct" as const, confidence: 95 },
      { label: "Packaging integrity", detail: "No visible damage, tampering, or seal issues were detected.", status: "correct" as const, confidence: 97 },
    ],
  },
  {
    detectedProduct: "Bottled Beverage",
    overallStatus: "warn" as const,
    confidence: 78,
    correctItems: ["Product name detected", "Packaging integrity"],
    incorrectItems: [] as string[],
    warnings: ["Expiry / batch code visibility", "Label readability"],
    checklist: [
      { label: "Product name detected", detail: "A clear, legible product name was located on the primary label.", status: "correct" as const, confidence: 90 },
      { label: "Expiry / batch code visibility", detail: "A code was found but partially cropped; recommend rescanning that area.", status: "warn" as const, confidence: 62 },
      { label: "Label readability", detail: "Some text was readable only after enhancement; confidence is reduced.", status: "warn" as const, confidence: 58 },
      { label: "Packaging integrity", detail: "No visible damage, tampering, or seal issues were detected.", status: "correct" as const, confidence: 91 },
    ],
  },
  {
    detectedProduct: "Cosmetic Container",
    overallStatus: "issue" as const,
    confidence: 51,
    correctItems: ["Packaging integrity"],
    incorrectItems: ["Authenticity markers", "Ingredient / material listing"],
    warnings: ["Label readability"],
    checklist: [
      { label: "Authenticity markers", detail: "Expected authenticity markers were not found where anticipated.", status: "issue" as const, confidence: 28 },
      { label: "Ingredient / material listing", detail: "No ingredient or material listing was detected on visible surfaces.", status: "issue" as const, confidence: 33 },
      { label: "Label readability", detail: "Some text was readable only after enhancement; confidence is reduced.", status: "warn" as const, confidence: 55 },
      { label: "Packaging integrity", detail: "No visible damage, tampering, or seal issues were detected.", status: "correct" as const, confidence: 88 },
    ],
  },
];

// A small solid-color JPEG, used as a placeholder image for seeded
// scans so the UI has something to render without needing real uploads.
const PLACEHOLDER_IMAGE = "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAHgAoADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAL/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCewFpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
    },
  });

  for (const sample of SAMPLE_SCANS) {
    await prisma.scan.create({
      data: {
        userId: user.id,
        imageUrl: PLACEHOLDER_IMAGE,
        detectedProduct: sample.detectedProduct,
        overallStatus: sample.overallStatus,
        confidence: sample.confidence,
        result: {
          create: {
            correctItems: sample.correctItems,
            incorrectItems: sample.incorrectItems,
            warnings: sample.warnings,
          },
        },
        checklistItems: { create: sample.checklist },
      },
    });
  }

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Seeded ${SAMPLE_SCANS.length} sample scans.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
