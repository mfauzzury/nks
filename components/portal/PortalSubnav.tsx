"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearPortalSession, type PortalSession } from "@/lib/portal-session";
import { useSiteSettings, resolveAssetUrl } from "@/lib/site-settings";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navByRole: Record<"individu" | "corporate", NavItem[]> = {
  individu: [
    { href: "/portal/individual/dashboard", label: "Dashboard" },
    { href: "/payer/individual/pay", label: "Bayar Zakat" },
    { href: "/payer/individual/register", label: "Kemaskini Profil" },
    { href: "/payer/individual/records", label: "Rekod Zakat" },
  ],
  corporate: [
    { href: "/portal/corporate/dashboard", label: "Dashboard" },
    { href: "/payer/corporate/zakat", label: "Bayar Zakat Korporat" },
    { href: "/payer/corporate/spg", label: "Urus SPG" },
    { href: "/payer/corporate/records", label: "Rekod Zakat" },
    {
      href: "#",
      label: "Kemaskini Syarikat",
      children: [
        { href: "/payer/corporate/register", label: "Kemaskini Syarikat" },
        { href: "/payer/corporate/employees", label: "Kemaskini Kakitangan" },
      ],
    },
  ],
};

function DropdownNavItem({
  item,
  variant,
  isActivePath,
}: {
  item: NavItem;
  variant: "default" | "onDark";
  isActivePath: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const anyChildActive = item.children?.some((child) => isActivePath(child.href)) ?? false;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
          anyChildActive
            ? "portal-btn-primary shadow-[0_0_14px_rgba(255,236,0,0.35)]"
            : variant === "onDark"
              ? "text-white/85 hover:bg-white/15 hover:text-white"
              : "text-slate-600 hover:bg-cyan-100/50 hover:text-slate-900",
        )}
      >
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1 min-w-50 overflow-hidden rounded-xl border shadow-lg",
            variant === "onDark"
              ? "border-white/20 bg-slate-900/95 backdrop-blur-sm"
              : "border-slate-200 bg-white",
          )}
        >
          {item.children!.map((child) => {
            const active = isActivePath(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "portal-btn-primary"
                    : variant === "onDark"
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-cyan-50 hover:text-slate-900",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PortalSubnav({
  role,
  session,
  variant = "default",
}: {
  role: "individu" | "corporate";
  session: PortalSession | null;
  variant?: "default" | "onDark";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useSiteSettings();
  const items = navByRole[role];

  function isActivePath(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function onLogout() {
    clearPortalSession();
    router.push("/portal/login");
  }

  return (
    <div className="w-full pb-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-0 py-0">
        <div className="flex flex-wrap items-center gap-2">
          {settings.portalLogoUrl ? (
            <span className="inline-flex items-center whitespace-nowrap px-1 py-2">
              <img src={resolveAssetUrl(settings.portalLogoUrl)} alt={settings.siteTitle || "Logo"} className="h-8 w-auto object-contain" />
            </span>
          ) : (
            <span className={cn("inline-flex items-center gap-2 whitespace-nowrap px-1 py-2 text-[18px] font-bold tracking-tight", variant === "onDark" ? "text-white" : "text-slate-800")}>
              <span className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border-2 border-white text-xs font-bold text-white">SK</span>
              {settings.siteTitle || "SenangKutipan"}
            </span>
          )}
          <span className={cn("ml-2.5 h-5 w-px shrink-0", variant === "onDark" ? "bg-white/30" : "bg-slate-300")} />
          <Link
            href="/"
            title="Back to Main"
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition",
              variant === "onDark"
                ? "text-white/85 hover:bg-white/15 hover:text-white"
                : "text-slate-600 hover:bg-cyan-100/50 hover:text-slate-900",
            )}
          >
            <Home className="h-4 w-4" />
          </Link>
          <span className={cn("h-5 w-px shrink-0", variant === "onDark" ? "bg-white/30" : "bg-slate-300")} />
          {items.map((item) => {
            if (item.children) {
              return (
                <DropdownNavItem
                  key={item.label}
                  item={item}
                  variant={variant}
                  isActivePath={isActivePath}
                />
              );
            }
            const active = isActivePath(item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "portal-btn-primary shadow-[0_0_14px_rgba(255,236,0,0.35)]"
                    : variant === "onDark"
                      ? "text-white/85 hover:bg-white/15 hover:text-white"
                      : "text-slate-600 hover:bg-cyan-100/50 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {session ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                variant === "onDark"
                  ? "border border-white/40 bg-transparent text-white hover:bg-white/15"
                  : "border border-cyan-200/80 bg-transparent text-slate-700 hover:bg-cyan-100/50",
              )}
            >
              <LogOut className="h-4 w-4" />
              Log Keluar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
