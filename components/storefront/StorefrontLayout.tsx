import { Chatbot } from "@/components/marketing/Chatbot";
import { type PortalSession } from "@/lib/portal-session";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";

export function StorefrontLayout({
  children,
  navVariant = "public",
  session,
  subnav,
  showFooter = true,
  showChatbot = true,
  mainClassName,
}: {
  children: React.ReactNode;
  navVariant?: "public" | "portal";
  session?: PortalSession | null;
  subnav?: React.ReactNode;
  showFooter?: boolean;
  showChatbot?: boolean;
  mainClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <StorefrontHeader navVariant={navVariant} session={session} />
      {subnav}
      <main className={mainClassName ?? "mx-auto w-full max-w-6xl px-6 py-8 md:py-10"}>{children}</main>
      {showFooter ? <StorefrontFooter /> : null}
      {showChatbot ? <Chatbot /> : null}
    </div>
  );
}
