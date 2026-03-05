import { Chatbot } from "@/components/marketing/Chatbot";
import { type PortalSession } from "@/lib/portal-session";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";

export function StorefrontLayout({
  children,
  navVariant = "public",
  session,
  subnav,
  showHeader = true,
  showFooter = true,
  showChatbot = true,
  mainClassName,
  wrapperClassName,
}: {
  children: React.ReactNode;
  navVariant?: "public" | "portal";
  session?: PortalSession | null;
  subnav?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showChatbot?: boolean;
  mainClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={wrapperClassName ?? "storefront-neon-bg min-h-screen text-slate-900"}>
      {showHeader ? <StorefrontHeader navVariant={navVariant} session={session} /> : null}
      <main className={mainClassName ?? "mx-auto w-full max-w-6xl px-6 py-8 md:py-10"}>
        {subnav}
        {children}
      </main>
      {showFooter ? <StorefrontFooter /> : null}
      {showChatbot ? <Chatbot /> : null}
    </div>
  );
}
