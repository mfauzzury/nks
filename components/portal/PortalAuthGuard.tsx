"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPortalSession, resolvePortalDashboard } from "@/lib/portal-session";
import { usePortalSession } from "@/lib/use-portal-session";

export function PortalAuthGuard({
  children,
  expected,
}: {
  children: React.ReactNode;
  expected: "individu" | "corporate";
}) {
  const router = useRouter();
  const session = usePortalSession();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Re-read from sessionStorage directly to avoid stale SSR snapshot
    const current = getPortalSession();
    if (!current) {
      router.replace("/portal/login");
      return;
    }

    if (expected === "individu" && current.payerType !== "individu") {
      router.replace(resolvePortalDashboard(current.payerType));
      return;
    }

    if (expected === "corporate" && current.payerType === "individu") {
      router.replace("/portal/individual/dashboard");
    }
  }, [expected, router, hydrated, session]);

  if (!hydrated || !session) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Memuatkan portal...</div>;
  }

  if (expected === "individu" && session.payerType !== "individu") {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Mengalihkan portal...</div>;
  }

  if (expected === "corporate" && session.payerType === "individu") {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Memuatkan portal...</div>;
  }

  return <>{children}</>;
}
