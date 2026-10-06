import type { Subscription, SubscriptionPlan } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const subscriptionsApi = {
  me: () => apiClient.get<Subscription>("/subscriptions/me"),
  checkout: (plan: SubscriptionPlan) =>
    apiClient.post<{ url?: string; subscription: Subscription }>("/subscriptions/checkout", {
      plan,
    }),
};
