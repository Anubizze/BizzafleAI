import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { LandingPricing } from "@/components/landing/pricing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Тарифы" };

export default function PricingPage() {
  return (
    <main>
      <LandingHeader />
      <div className="pt-16">
        <LandingPricing />
      </div>
      <LandingFooter />
    </main>
  );
}
