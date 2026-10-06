"use client";

import { LandingPricing } from "@/components/landing/pricing";
import { ApiError } from "@/lib/api/client";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { DEMO_SUBSCRIPTION } from "@/lib/demo-data";
import type { SubscriptionPlan } from "@bizaffle/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function BillingPage() {
  const sub = useQuery({ queryKey: ["subscription"], queryFn: subscriptionsApi.me, retry: 0 });
  const current = sub.data ?? DEMO_SUBSCRIPTION;

  async function choose(plan: SubscriptionPlan) {
    try {
      const result = await subscriptionsApi.checkout(plan);
      toast.success(`Тариф ${result.subscription.plan} обновлён`);
      if (result.url) window.location.href = result.url;
      else sub.refetch();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Оплата недоступна");
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Подписка</p>
      <h1 className="display mt-2 text-5xl">
        {current.plan} · {current.status}
      </h1>
      <LandingPricing onSelect={choose} />
    </div>
  );
}
