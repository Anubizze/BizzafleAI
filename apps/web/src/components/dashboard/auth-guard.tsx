"use client";

import { isDemoMode } from "@/lib/demo-mode";
import { enterDemoSession } from "@/lib/demo-session";
import { useAuthStore } from "@/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) {
      void useAuthStore.persist.rehydrate();
      return;
    }
    if (isDemoMode && !accessToken) {
      enterDemoSession();
      return;
    }
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && !user.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
      return;
    }
    if (user?.onboardingCompleted && pathname.startsWith("/onboarding")) {
      router.replace("/dashboard");
    }
  }, [hydrated, accessToken, user, pathname, router]);

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-ink-faint">Загрузка…</div>
    );
  }
  if (!accessToken && !isDemoMode) return null;
  return <>{children}</>;
}
