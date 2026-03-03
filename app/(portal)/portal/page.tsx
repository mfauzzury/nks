"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPortalSession, resolvePortalDashboard } from "@/lib/portal-session";

export default function PortalEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.replace("/portal/login");
      return;
    }
    router.replace(resolvePortalDashboard(session.payerType));
  }, [router]);

  return <div className="p-8 text-sm text-slate-500">Memuatkan portal...</div>;
}
