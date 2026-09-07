"use client";

import { RequireAuth } from "./RequireAuth";
import { Nav } from "./Nav";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-ink">
        <Nav />
        <main className="pb-24 md:pb-10">{children}</main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
