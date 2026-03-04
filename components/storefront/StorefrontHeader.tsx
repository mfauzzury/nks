"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { type PortalSession } from "@/lib/portal-session";
import { PortalEntryButton } from "@/components/storefront/PortalEntryButton";

type NavVariant = "public" | "portal";

export function StorefrontHeader({
  navVariant = "public",
}: {
  navVariant?: NavVariant;
  session?: PortalSession | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPortal = navVariant === "portal";
  const menuLinks = useMemo(
    () => [
      { href: "/zakat-types", label: "Jenis Zakat" },
      { href: "/about", label: "Tentang" },
      { href: "/contact", label: "Hubungi" },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f4ed8] text-sm font-bold text-white">NKS</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">NKS Digital Zakat</p>
            <p className="text-xs text-slate-500">Portal Pembayar</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {menuLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "text-[#1f4ed8]" : "hover:text-slate-900"}
              >
                {item.label}
              </Link>
            );
          })}

          {!isPortal ? (
            <PortalEntryButton className="rounded-lg bg-[#1f4ed8] px-4 py-2 text-white transition hover:bg-[#1a42ba]" />
          ) : null}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 md:hidden"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-1 px-6 py-3">
            {menuLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-[#1f4ed8] text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {!isPortal ? (
              <PortalEntryButton
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-[#1f4ed8] px-3 py-2 text-center text-sm font-semibold text-white"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
