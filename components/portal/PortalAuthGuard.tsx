"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPortalSession, resolvePortalDashboard, type PortalSession } from "@/lib/portal-session";

export function PortalAuthGuard({
  children,
  expected,
}: {
  children: React.ReactNode;
  expected: "individu" | "corporate";
}) {
  const router = useRouter();
  const session: PortalSession | null = getPortalSession();

  useEffect(() => {
    if (!session) {
      router.replace("/portal/login");
      return;
    }

    if (expected === "individu" && session.payerType !== "individu") {
      router.replace(resolvePortalDashboard(session.payerType));
      return;
    }

    if (expected === "corporate" && session.payerType === "individu") {
      router.replace("/portal/individual/dashboard");
    }
  }, [expected, router, session]);

  if (!session) {
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
