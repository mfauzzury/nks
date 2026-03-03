"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearPortalSession, type PortalSession } from "@/lib/portal-session";

const navByRole = {
  individu: [
    { href: "/portal/individual/dashboard", label: "Dashboard" },
    { href: "/payer/individual/pay", label: "Bayar Zakat" },
    { href: "/payer/individual/register", label: "Kemaskini Profil" },
    { href: "/payer/individual/records", label: "Rekod Sumbangan" },
  ],
  corporate: [
    { href: "/portal/corporate/dashboard", label: "Dashboard" },
    { href: "/payer/corporate/zakat", label: "Bayar Zakat Korporat" },
    { href: "/payer/corporate/spg", label: "Urus SPG" },
    { href: "/payer/corporate/records", label: "Rekod Sumbangan" },
    { href: "/payer/corporate/register", label: "Kemaskini Syarikat" },
  ],
} as const;

export function PortalSubnav({
  role,
  session,
}: {
  role: "individu" | "corporate";
  session: PortalSession | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navByRole[role];

  function isActivePath(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function onLogout() {
    clearPortalSession();
    router.push("/portal/login");
  }

  return (
    <div className="border-b border-slate-200 bg-white/90">
      <div className="mx-auto w-full max-w-6xl px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {items.map((item) => {
              const active = isActivePath(item.href);
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[#1f4ed8] text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {session ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800">{session.displayName}</p>
                <p className="text-[11px] text-slate-500">{session.payerCode}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Log Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
