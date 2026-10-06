import { AuthGuard } from "@/components/dashboard/auth-guard";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Онбординг" };

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingFlow />
    </AuthGuard>
  );
}
