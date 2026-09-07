"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScanLine, LayoutGrid, History, Settings, LogOut, ScanText } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/scan", label: "Scan", icon: ScanText },
  { href: "/history", label: "History", icon: History },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-line bg-ink/80 backdrop-blur sticky top-0 z-30">
      <Link href="/dashboard" className="flex items-center gap-2">
        <ScanLine size={18} className="text-signal" />
        <span className="font-medium tracking-tight">ScanVerify</span>
      </Link>

      <nav className="flex items-center gap-1 bg-surface border border-line rounded-full p-1">
        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          const Icon = link.icon;
          const emphasized = link.href === "/scan";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors",
                emphasized && !active && "bg-signal text-ink font-medium hover:brightness-110",
                active && "bg-surface2 text-paper",
                !active && !emphasized && "text-muted hover:text-paper"
              )}
            >
              <Icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted hidden lg:inline">{session?.name}</span>
        <button
          title="Settings"
          className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-muted hover:text-paper hover:border-muted transition-colors"
        >
          <Settings size={15} />
        </button>
        <button
          title="Log out"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-muted hover:text-issue hover:border-issue/50 transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
