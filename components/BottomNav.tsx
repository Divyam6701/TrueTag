"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, ScanText, Home, User } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: History },
  { href: "/scan", label: "Scan", icon: ScanText, emphasized: true },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-center justify-between">
        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          const Icon = link.icon;
          if (link.emphasized) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-1 -mt-6"
              >
                <span className="w-14 h-14 rounded-full bg-signal text-ink flex items-center justify-center shadow-soft">
                  <Icon size={22} />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-[11px]",
                active ? "text-paper" : "text-muted"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
