export type Verdict = "correct" | "issue" | "warn";

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  status: Verdict;
  confidence: number; // 0-100
}

export interface ScanResult {
  scanId: string;
  product: string;
  overallStatus: Verdict;
  correctItems: string[];
  incorrectItems: string[];
  warnings: string[];
  checklist: ChecklistItem[];
  confidence: number;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  result: ScanResult;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Demo-mode only: never do this with real passwords in production.
  passwordHash: string;
}

export interface Session {
  userId: string;
  name: string;
  email: string;
}
