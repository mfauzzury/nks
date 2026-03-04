 "use client";

import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { usePortalSession } from "@/lib/use-portal-session";

export default function PayerLayout({ children }: { children: React.ReactNode }) {
  const session = usePortalSession();
  const isPortalSession = Boolean(session);

  return (
    <StorefrontLayout
      navVariant={isPortalSession ? "portal" : "public"}
      session={session}
      subnav={undefined}
      showChatbot={!session}
      showHeader={false}
      showFooter={false}
      wrapperClassName="portal-cosmic-bg min-h-screen text-slate-900"
      mainClassName="mx-auto w-full max-w-6xl px-6 pt-0 pb-0"
    >
      {children}
    </StorefrontLayout>
  );
}
