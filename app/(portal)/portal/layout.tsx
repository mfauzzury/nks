"use client";

import { usePathname } from "next/navigation";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { getPortalSession } from "@/lib/portal-session";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/portal/login";
  const session = getPortalSession();
  const role = session?.payerType === "individu" ? "individu" : "corporate";
  const showPortalNav = !isLoginPage && Boolean(session);

  return (
    <StorefrontLayout
      navVariant={showPortalNav ? "portal" : "public"}
      session={session}
      subnav={showPortalNav ? <PortalSubnav role={role} session={session} /> : undefined}
      showChatbot={!session}
      mainClassName="mx-auto w-full max-w-6xl px-6 py-6 md:py-8"
    >
      {children}
    </StorefrontLayout>
  );
}
