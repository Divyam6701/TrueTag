import { nanoid } from "nanoid";
import type { ChecklistItem, ScanResult, Verdict } from "./types";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Maps each extracted field to a human-readable checklist label,
// and what to say when it's present vs. missing.
const FIELD_DEFINITIONS: Array<{
  key: string;
  label: string;
  correctDetail: string;
  issueDetail: string;
}> = [
  { key: "commodity_name", label: "Product identity", correctDetail: "Product name/identity is clearly declared.", issueDetail: "Product name/identity could not be found." },
  { key: "manufacturer_details", label: "Manufacturer details", correctDetail: "Manufacturer/packer/importer name and address found.", issueDetail: "Manufacturer/packer/importer details are missing." },
  { key: "net_quantity", label: "Net quantity", correctDetail: "Net quantity is declared in a standard unit.", issueDetail: "Net quantity declaration is missing or non-standard." },
  { key: "mfg_date", label: "Manufacturing date", correctDetail: "Month and year of manufacture/packing found.", issueDetail: "Manufacturing/packing date is missing." },
  { key: "expiry_info", label: "Expiry / best-before", correctDetail: "Expiry date or best-before duration found.", issueDetail: "Expiry/best-before declaration is missing or unclear." },
  { key: "mrp", label: "MRP declaration", correctDetail: "MRP is declared, inclusive of all taxes.", issueDetail: "MRP is missing or doesn't state 'inclusive of all taxes'." },
  { key: "unit_sale_price", label: "Unit sale price", correctDetail: "Per-unit price breakdown is declared.", issueDetail: "Unit sale price declaration is missing." },
  { key: "consumer_care", label: "Consumer care details", correctDetail: "Consumer care contact (phone/email) found.", issueDetail: "Consumer care details are missing." },
];

export async function analyzeProduct(input: string | Buffer): Promise<ScanResult> {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;

 const formData = new FormData();

const arrayBuffer = new ArrayBuffer(buffer.byteLength);
new Uint8Array(arrayBuffer).set(buffer);

formData.append(
  "file",
  new Blob([arrayBuffer], { type: "image/jpeg" }),
  "scan.jpg"
);;

  const response = await fetch(`${BACKEND_URL}/api/scan`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Backend scan failed: ${response.status}`);
  }

  const result = await response.json();
  // result shape: { id, filename, status, violations: string[], data: {...extracted fields} }

  const extracted = result.data || {};
  const violationMessages: string[] = result.violations || [];

  // Build checklist from the extracted field data (found/not found per field)
  const checklist: ChecklistItem[] = FIELD_DEFINITIONS.map((def, i) => {
    // country of origin only applies if imported — skip entirely if not
    const found = extracted[def.key]?.found === true;
    const status: Verdict = found ? "correct" : "issue";
    return {
      id: nanoid(8),
      label: def.label,
      detail: found ? def.correctDetail : def.issueDetail,
      status,
      confidence: found ? 90 : 40,
    };
  });

  // Readability / font-size check (Rule 7)
  const readability = extracted.readability || {};
  const isReadabilityIssue = readability.overall_legibility === "illegible" || readability.mrp_text_relative_size === "small";
  const isReadabilityWarning = readability.overall_legibility === "reduced";
  const readabilityStatus: Verdict = isReadabilityIssue ? "issue" : isReadabilityWarning ? "warn" : "correct";

  checklist.push({
    id: nanoid(8),
    label: "Font size / readability",
    detail:
      readabilityStatus === "correct"
        ? "Declarations appear clearly legible and appropriately sized per Rule 7."
        : readabilityStatus === "warn"
        ? `Legibility is reduced and should be reviewed. ${readability.notes || ""}`.trim()
        : `Font size or legibility does not appear to meet Rule 7 requirements. ${readability.notes || ""}`.trim(),
    status: readabilityStatus,
    confidence: readabilityStatus === "correct" ? 85 : readabilityStatus === "warn" ? 55 : 35,
  });

  // Add country of origin only if the product is imported
  if (extracted.is_imported) {
    const found = extracted.country_of_origin?.found === true;
    checklist.push({
      id: nanoid(8),
      label: "Country of origin",
      detail: found ? "Country of origin declared for this imported product." : "Country of origin is missing for this imported product.",
      status: found ? "correct" : "issue",
      confidence: found ? 90 : 40,
    });
  }

    // MRP sticker-tampering detection
  const tampering = extracted.mrp_tampering || {};
  const tamperingDetected = tampering.sticker_overlay_detected === true;
  const tamperingStatus: Verdict = tamperingDetected
    ? (tampering.confidence === "high" ? "issue" : "warn")
    : "correct";

  checklist.push({
    id: nanoid(8),
    label: "MRP tampering check",
    detail: tamperingDetected
      ? `Possible sticker overlay detected on MRP (${tampering.confidence} confidence). ${tampering.notes || ""}`.trim()
      : "No visual evidence of a pasted-over MRP sticker was found.",
    status: tamperingStatus,
    confidence: tamperingDetected ? (tampering.confidence === "high" ? 75 : 55) : 85,
  });

  const correctItems = checklist.filter((c) => c.status === "correct").map((c) => c.label);
  const incorrectItems = checklist.filter((c) => c.status === "issue").map((c) => c.label);

  

  const overallStatus: Verdict = result.status === "COMPLIANT" ? "correct" : "issue";

  const confidence = Math.round(
    checklist.reduce((sum, c) => sum + c.confidence, 0) / checklist.length
  );

  return {
    scanId: String(result.id),
    product: extracted.commodity_name?.value || "Packaged Commodity",
    overallStatus,
    correctItems,
    incorrectItems,
    warnings: violationMessages, // surface the exact rule-citation violation text here too
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