import type { Metadata } from "next";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";

export const metadata: Metadata = {
  title: "NKS Digital Zakat",
  description: "Portal zakat untuk pembayar individu, korporat, dan skim potongan gaji (SPG).",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
