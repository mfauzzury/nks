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
    <header className="sticky top-0 z-40 border-b border-purple-200/70 bg-[#f8fcff]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border-2 border-[#7E30E1] text-xs font-bold text-[#7E30E1]">SK</span>
          <span className="text-[18px] font-bold tracking-tight text-slate-800">SenangKutipan</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {menuLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "text-[#7E30E1] drop-shadow-[0_0_8px_rgba(126,48,225,0.35)]" : "hover:text-slate-900"}
              >
                {item.label}
              </Link>
            );
          })}

          {!isPortal ? (
            <PortalEntryButton className="rounded-lg bg-linear-to-r from-[#E26EE5] to-[#7E30E1] px-4 py-2 text-white shadow-[0_0_12px_rgba(126,48,225,0.3)] transition hover:brightness-105" />
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
        <div className="border-t border-purple-100 bg-[#f8fcff] md:hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-1 px-6 py-3">
            {menuLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-linear-to-r from-[#E26EE5] to-[#7E30E1] text-white shadow-[0_0_14px_rgba(226,110,229,0.34)]" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {!isPortal ? (
              <PortalEntryButton
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-linear-to-r from-[#E26EE5] to-[#7E30E1] px-3 py-2 text-center text-sm font-semibold text-white shadow-[0_0_12px_rgba(126,48,225,0.3)]"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
