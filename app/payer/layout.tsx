 "use client";

import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { getPortalSession } from "@/lib/portal-session";

export default function PayerLayout({ children }: { children: React.ReactNode }) {
  const session = getPortalSession();
  const role = session?.payerType === "individu" ? "individu" : "corporate";
  const isPortalSession = Boolean(session);

  return (
    <StorefrontLayout
      navVariant={isPortalSession ? "portal" : "public"}
      session={session}
      subnav={isPortalSession ? <PortalSubnav role={role} session={session} /> : undefined}
      showChatbot={!session}
      mainClassName="mx-auto w-full max-w-6xl px-6 py-6 md:py-8"
    >
      {children}
    </StorefrontLayout>
  );
}
