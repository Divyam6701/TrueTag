"use client";

import type { ScanRecord, Session } from "./types";

/**
 * API CLIENT
 * -------------------------------------------------------------
 * Thin wrapper around the real backend routes (see app/api/**). This
 * used to be a localStorage-backed demo store; it now talks to the
 * Postgres-backed API, but keeps the same exported shape (`auth.*`,
 * `scans.*`) so the rest of the app didn't need to be redesigned.
 */

type AuthResult = { ok: true; session: Session } | { ok: false; error: string };

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toSession(user: { id: string; name: string; email: string }): Session {
  return { userId: user.id, name: user.name, email: user.email };
}

export const auth = {
  async me(): Promise<Session | null> {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await parseJson(res);
    return data?.user ? toSession(data.user) : null;
  },

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false, error: data?.error || "Something went wrong. Please try again." };
    return { ok: true, session: toSession(data.user) };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false, error: data?.error || "Something went wrong. Please try again." };
    return { ok: true, session: toSession(data.user) };
  },

  async loginAsGuest(): Promise<Session> {
    const res = await fetch("/api/auth/guest", { method: "POST", credentials: "include" });
    const data = await parseJson(res);
    if (!res.ok) throw new Error(data?.error || "Couldn't start a guest session.");
    return toSession(data.user);
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  },
};

export const scans = {
  async list(): Promise<ScanRecord[]> {
    const res = await fetch("/api/scans", { credentials: "include" });
    if (!res.ok) return [];
    const data = await parseJson(res);
    return data?.scans ?? [];
  },

  async get(id: string): Promise<ScanRecord | undefined> {
    const res = await fetch(`/api/scan/${id}`, { credentials: "include" });
    if (!res.ok) return undefined;
    return (await parseJson(res)) as ScanRecord;
  },

  async create(imageBlob: Blob): Promise<{ ok: true; record: ScanRecord } | { ok: false; error: string }> {
    const formData = new FormData();
    formData.append("image", imageBlob, "upload.jpg");
    const res = await fetch("/api/scan", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false, error: data?.error || "We couldn't analyze that image. Please try again." };
    return { ok: true, record: data as ScanRecord };
  },

  async remove(id: string): Promise<void> {
    await fetch(`/api/scan/${id}`, { method: "DELETE", credentials: "include" });
  },
};

export async function fetchDashboardStats() {
  const res = await fetch("/api/dashboard", { credentials: "include" });
  if (!res.ok) return { total: 0, successful: 0, warnings: 0, issues: 0 };
  return parseJson(res);
}

export function downloadReportPdf(scanId: string) {
  // Server route is a plain authenticated GET, so a direct navigation
  // (new tab) lets the browser handle the download/Content-Disposition
  // without us having to manage a blob URL.
  window.open(`/api/reports/${scanId}/pdf`, "_blank");
}
