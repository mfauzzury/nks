"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, FileText, LayoutDashboard, Settings, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navByRole = {
  individu: [
    { href: "/portal/individual/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/payer/individual/pay", label: "Bayar Zakat", icon: CreditCard },
    { href: "/payer/individual/register", label: "Kemaskini Profil", icon: UserRound },
    { href: "/payer/individual/pay", label: "Rekod Sumbangan", icon: FileText },
  ],
  corporate: [
    { href: "/portal/corporate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/payer/corporate/zakat", label: "Bayar Zakat Korporat", icon: Building2 },
    { href: "/payer/corporate/spg", label: "Urus SPG", icon: Users },
    { href: "/payer/corporate/register", label: "Kemaskini Syarikat", icon: Settings },
  ],
} as const;

export function PortalSidebar({ role }: { role: "individu" | "corporate" }) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <aside className="w-full shrink-0 border-r border-slate-200 bg-white md:w-64">
      <nav className="grid gap-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[#1f4ed8] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
