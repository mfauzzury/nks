"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearPortalSession, type PortalSession } from "@/lib/portal-session";

export function PortalHeader({ session }: { session: PortalSession | null }) {
  const router = useRouter();

  function onLogout() {
    clearPortalSession();
    router.push("/portal/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Portal Pembayar NKS</p>
          <p className="text-xs text-slate-500">{session?.displayName || "Pengguna"}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Log Keluar
        </button>
      </div>
    </header>
  );
}
