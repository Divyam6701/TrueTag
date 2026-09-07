import "server-only";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

type Verdict = "correct" | "issue" | "warn";

export interface ReportChecklistItem {
  label: string;
  detail: string;
  status: Verdict;
  confidence: number;
}

export interface ReportData {
  scanId: string;
  product: string;
  overallStatus: Verdict;
  correctItems: string[];
  incorrectItems: string[];
  warnings: string[];
  checklist: ReportChecklistItem[];
  confidence: number;
  createdAt: Date;
  imageUrl: string; // local path under /public, e.g. /uploads/xxx.jpg
}

const STATUS_LABEL: Record<Verdict, string> = {
  correct: "PASSED VERIFICATION",
  warn: "PASSED WITH WARNINGS",
  issue: "VERIFICATION ISSUES FOUND",
};

const STATUS_RGB: Record<Verdict, [number, number, number]> = {
  correct: [0.27, 0.55, 0.39],
  warn: [0.67, 0.51, 0.16],
  issue: [0.67, 0.27, 0.24],
};

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) {
    throw new Error("Expected a base64 data URL for the scan image.");
  }
  return Buffer.from(match[1], "base64");
}

export async function generateReportPdfBuffer(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]); // A4 in points
  const { width } = page.getSize();
  const margin = 48;

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const black = rgb(0.08, 0.08, 0.08);
  const gray = rgb(0.42, 0.42, 0.42);
  const lightGray = rgb(0.86, 0.86, 0.86);
  const statusColor = rgb(...STATUS_RGB[data.overallStatus]);

  let y = 841.89 - 56;

  const ensureSpace = (needed: number) => {
    if (y - needed < 56) {
      page = doc.addPage([595.28, 841.89]);
      y = 841.89 - 56;
    }
  };

  // Header
  page.drawText("SCANVERIFY", { x: margin, y, size: 12, font: fontBold, color: black });
  page.drawText("AI Product Verification Platform", {
    x: margin,
    y: y - 14,
    size: 9,
    font: fontRegular,
    color: gray,
  });

  const reportIdText = `Report ID: ${data.scanId}`;
  const issuedText = `Issued: ${data.createdAt.toLocaleString()}`;
  page.drawText(reportIdText, {
    x: width - margin - fontRegular.widthOfTextAtSize(reportIdText, 9),
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(issuedText, {
    x: width - margin - fontRegular.widthOfTextAtSize(issuedText, 9),
    y: y - 14,
    size: 9,
    font: fontRegular,
    color: gray,
  });

  y -= 34;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: lightGray });
  y -= 30;

  // Title
  page.drawText("Official Verification Notice", { x: margin, y, size: 20, font: fontBold, color: black });
  y -= 22;
  page.drawText(`Product: ${data.product}`, { x: margin, y, size: 11, font: fontRegular, color: gray });
  y -= 28;

  // Status badge
  page.drawRectangle({ x: margin, y: y - 6, width: 240, height: 28, color: statusColor });
  page.drawText(STATUS_LABEL[data.overallStatus], {
    x: margin + 14,
    y: y + 4,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Overall confidence: ${data.confidence}%`, {
    x: margin + 260,
    y: y + 4,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  y -= 46;

  // Product image
  const imageColumnWidth = 140;
  const textX = margin + imageColumnWidth + 20;
  const imageTopY = y;

  try {
    const bytes = dataUrlToBuffer(data.imageUrl);
    const image = await doc.embedJpg(bytes).catch(() => doc.embedPng(bytes));
    const scale = imageColumnWidth / image.width;
    const imgHeight = image.height * scale;
    page.drawRectangle({
      x: margin,
      y: imageTopY - Math.max(imgHeight, 140),
      width: imageColumnWidth,
      height: Math.max(imgHeight, 140),
      borderColor: lightGray,
      borderWidth: 1,
    });
    page.drawImage(image, {
      x: margin,
      y: imageTopY - Math.max(imgHeight, 140),
      width: imageColumnWidth,
      height: Math.max(imgHeight, 140),
    });
  } catch {
    // Non-fatal: proceed without the embedded image if it can't be read.
  }

  // Summary text (right column)
  let ty = imageTopY;
  page.drawText("Analysis Summary", { x: textX, y: ty, size: 11, font: fontBold, color: black });
  ty -= 16;

  const summary = `This product was analyzed against ${data.checklist.length} verification criteria. ${data.correctItems.length} passed, ${data.warnings.length} require review, and ${data.incorrectItems.length} did not meet requirements.`;
  const summaryLines = wrapText(summary, fontRegular, 9.5, width - margin - textX);
  for (const line of summaryLines) {
    page.drawText(line, { x: textX, y: ty, size: 9.5, font: fontRegular, color: gray });
    ty -= 12;
  }
  ty -= 6;

  const printList = (title: string, items: string[], color: [number, number, number]) => {
    if (items.length === 0) return;
    page.drawText(title, { x: textX, y: ty, size: 9.5, font: fontBold, color: rgb(...color) });
    ty -= 13;
    for (const item of items) {
      page.drawText(`- ${item}`, { x: textX + 4, y: ty, size: 9, font: fontRegular, color: gray });
      ty -= 12;
    }
    ty -= 4;
  };

  printList("Correct", data.correctItems, STATUS_RGB.correct);
  printList("Warnings", data.warnings, STATUS_RGB.warn);
  printList("Issues", data.incorrectItems, STATUS_RGB.issue);

  y = Math.min(imageTopY - 160, ty) - 10;

  // Checklist
  ensureSpace(60);
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: lightGray });
  y -= 24;
  page.drawText("Verification Checklist", { x: margin, y, size: 12, font: fontBold, color: black });
  y -= 20;

  for (const item of data.checklist) {
    ensureSpace(50);
    const c = rgb(...STATUS_RGB[item.status]);
    page.drawCircle({ x: margin + 4, y: y + 3, size: 3.5, color: c });

    page.drawText(item.label, { x: margin + 16, y, size: 10, font: fontBold, color: rgb(0.12, 0.12, 0.12) });

    const confText = `${item.confidence}% confidence`;
    page.drawText(confText, {
      x: width - margin - fontRegular.widthOfTextAtSize(confText, 9),
      y,
      size: 9,
      font: fontRegular,
      color: gray,
    });

    y -= 13;
    const detailLines = wrapText(item.detail, fontRegular, 9, width - margin * 2 - 16);
    for (const line of detailLines) {
      ensureSpace(14);
      page.drawText(line, { x: margin + 16, y, size: 9, font: fontRegular, color: gray });
      y -= 11;
    }
    y -= 12;
  }

  // Disclaimer
  ensureSpace(60);
  y -= 4;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: lightGray });
  y -= 18;
  const disclaimer =
    "This notice was generated by an automated AI visual analysis pipeline and is provided for informational purposes. It does not constitute a legal, regulatory, or safety certification. For compliance-critical decisions, verify findings against official standards and consult a qualified authority.";
  const discLines = wrapText(disclaimer, fontItalic, 8, width - margin * 2);
  for (const line of discLines) {
    page.drawText(line, { x: margin, y, size: 8, font: fontItalic, color: gray });
    y -= 10;
  }

  return doc.save();
}
