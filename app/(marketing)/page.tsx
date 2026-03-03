import { CTASection } from "@/components/marketing/CTASection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Hero } from "@/components/marketing/Hero";
import { PaymentChannels } from "@/components/marketing/PaymentChannels";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";
import { TrustBar } from "@/components/marketing/TrustBar";

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <Hero />
      <TrustBar />
      <FeatureGrid />
      <PaymentChannels />
      <ProcessSteps />
      <CTASection />
    </div>
  );
}
