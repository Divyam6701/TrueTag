"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";

export default function AccountPage() {
  const { session, logout } = useAuth();
  const router = useRouter();

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-md mx-auto">
        <h1 className="font-display text-3xl mb-8">Account</h1>

        <div className="border border-line rounded-2xl p-6 bg-surface/40 mb-6">
          <div className="w-14 h-14 rounded-full bg-surface2 border border-line flex items-center justify-center mb-4">
            <User size={22} className="text-muted" />
          </div>
          <p className="font-medium">{session?.name}</p>
          <p className="text-muted text-sm">{session?.email}</p>
        </div>

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full inline-flex items-center justify-center gap-2 border border-line rounded-full py-3 text-sm font-medium hover:border-issue/50 hover:text-issue transition-colors"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </AppShell>
  );
}
