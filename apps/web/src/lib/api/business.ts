import type { BusinessHealth, BusinessMetric } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const businessApi = {
  metrics: () => apiClient.get<BusinessMetric[]>("/business/metrics"),
  healthCheck: (answers: Record<string, number | string>) =>
    apiClient.post<BusinessHealth>("/business/health-check", { answers }),
  swot: (payload: Record<string, string>) =>
    apiClient.post<Record<string, string[]>>("/business/swot", payload),
  unitEconomics: (payload: Record<string, number>) =>
    apiClient.post<Record<string, number>>("/business/unit-economics", payload),
};
