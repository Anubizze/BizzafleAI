import { LandingBusiness } from "@/components/landing/for-business";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingTeam } from "@/components/landing/ai-team";

export default function HomePage() {
  return (
    <main>
      <LandingHeader />
      <LandingHero />
      <LandingTeam />
      <LandingFeatures />
      <LandingBusiness />
      <LandingPricing />
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}
