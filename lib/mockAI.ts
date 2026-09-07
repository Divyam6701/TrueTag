import { nanoid } from "nanoid";
import type { ChecklistItem, ScanResult, Verdict } from "./types";

/**
 * MOCK AI ANALYSIS SERVICE
 * -------------------------------------------------------------
 * This module stands in for a real computer-vision / OCR / vision-LLM
 * pipeline (e.g. a custom CV model, Gemini Vision, GPT-4o vision, or an
 * OCR service). It is intentionally isolated behind a single function,
 * `analyzeProduct`, so the rest of the app never depends on how the
 * analysis is actually produced.
 *
 * TO CONNECT A REAL MODEL:
 * Replace the body of `analyzeProduct` with a call to your inference
 * endpoint (ideally from a server route, e.g. POST /api/scan), keeping
 * the same input/output shape (`ScanResult`). Nothing in the UI needs
 * to change.
 */

// Simple deterministic hash so the same uploaded image always produces
// the same mock result (useful for demos and predictable QA).
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PRODUCT_NAMES = [
  "Packaged Snack Product",
  "Bottled Beverage",
  "Cosmetic Container",
  "Household Cleaning Product",
  "Over-the-Counter Supplement",
  "Electronics Accessory Packaging",
];

const CHECKLIST_TEMPLATE: Array<{
  label: string;
  detail: { correct: string; issue: string; warn: string };
  weight: number; // likelihood of being flagged, 0-1 (higher = more likely correct)
}> = [
  {
    label: "Product name detected",
    detail: {
      correct: "A clear, legible product name was located on the primary label.",
      issue: "No readable product name could be located on the packaging.",
      warn: "A product name was found but partially obscured by glare or folds.",
    },
    weight: 0.85,
  },
  {
    label: "Required information present",
    detail: {
      correct: "Mandatory disclosure fields (net weight, manufacturer, origin) were all found.",
      issue: "One or more mandatory disclosure fields could not be located.",
      warn: "Most required fields were found; one field needs manual confirmation.",
    },
    weight: 0.7,
  },
  {
    label: "Label readability",
    detail: {
      correct: "Text contrast and resolution were sufficient for reliable OCR extraction.",
      issue: "Text was too low-resolution or low-contrast to extract reliably.",
      warn: "Some text was readable only after enhancement; confidence is reduced.",
    },
    weight: 0.75,
  },
  {
    label: "Packaging integrity",
    detail: {
      correct: "No visible damage, tampering, or seal issues were detected.",
      issue: "Visible damage or a broken seal was detected on the packaging.",
      warn: "Minor cosmetic wear was detected; unlikely to affect product integrity.",
    },
    weight: 0.8,
  },
  {
    label: "Ingredient / material listing",
    detail: {
      correct: "The ingredient or material listing was detected and matches expected format.",
      issue: "No ingredient or material listing was detected on visible surfaces.",
      warn: "A listing was found but was incomplete or cropped out of frame.",
    },
    weight: 0.65,
  },
  {
    label: "Authenticity markers",
    detail: {
      correct: "Expected authenticity markers (hologram, batch code, or seal) were verified.",
      issue: "Expected authenticity markers were not found where anticipated.",
      warn: "An authenticity marker was found but could not be fully verified from this angle.",
    },
    weight: 0.6,
  },
  {
    label: "Expiry / batch code visibility",
    detail: {
      correct: "A batch code or expiry date was located and appears well-formed.",
      issue: "No batch code or expiry date could be located in the image.",
      warn: "A code was found but partially cropped; recommend rescanning that area.",
    },
    weight: 0.55,
  },
];

function pickVerdict(rand: number, weight: number): Verdict {
  if (rand < weight) return "correct";
  if (rand < weight + (1 - weight) * 0.6) return "warn";
  return "issue";
}

export async function analyzeProduct(seedInput: string | Buffer): Promise<ScanResult> {
  // Simulate network + inference latency for a believable pipeline feel.
  await new Promise((resolve) => setTimeout(resolve, 400));

  const seedSource =
    typeof seedInput === "string"
      ? seedInput.slice(0, 5000) + seedInput.length
      : seedInput.subarray(0, 5000).toString("base64") + seedInput.length;

  const seed = hashString(seedSource);
  const rand = (i: number) => {
    const x = Math.sin(seed + i * 999) * 10000;
    return x - Math.floor(x);
  };

  const product = PRODUCT_NAMES[seed % PRODUCT_NAMES.length];

  const checklist: ChecklistItem[] = CHECKLIST_TEMPLATE.map((item, i) => {
    const r = rand(i);
    const status = pickVerdict(r, item.weight);
    const confidence = Math.round(
      status === "correct"
        ? 88 + rand(i + 50) * 11
        : status === "warn"
        ? 55 + rand(i + 50) * 25
        : 20 + rand(i + 50) * 30
    );
    return {
      id: nanoid(8),
      label: item.label,
      detail: item.detail[status],
      status,
      confidence,
    };
  });

  const correctItems = checklist.filter((c) => c.status === "correct").map((c) => c.label);
  const incorrectItems = checklist.filter((c) => c.status === "issue").map((c) => c.label);
  const warnings = checklist.filter((c) => c.status === "warn").map((c) => c.label);

  let overallStatus: Verdict = "correct";
  if (incorrectItems.length > 0) overallStatus = "issue";
  else if (warnings.length > 0) overallStatus = "warn";

  const confidence = Math.round(
    checklist.reduce((sum, c) => sum + c.confidence, 0) / checklist.length
  );

  return {
    scanId: nanoid(12),
    product,
    overallStatus,
    correctItems,
    incorrectItems,
    warnings,
    checklist,
    confidence,
    createdAt: new Date().toISOString(),
  };
}

export const PIPELINE_STAGES = [
  "Uploading image...",
  "Detecting product...",
  "Reading information...",
  "Analyzing details...",
  "Verifying requirements...",
  "Generating results...",
] as const;
