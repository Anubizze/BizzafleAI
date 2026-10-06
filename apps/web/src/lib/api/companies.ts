import type { Company } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export type CompanyPayload = Pick<
  Company,
  "name" | "type" | "binIin" | "industry" | "taxRegime" | "employeeCount" | "primaryGoal"
> & { registeredAt?: string | null };

export const companiesApi = {
  list: () => apiClient.get<Company[]>("/companies"),
  me: () => apiClient.get<Company>("/companies/current"),
  create: (payload: CompanyPayload) => apiClient.post<Company>("/companies", payload),
  update: (id: string, payload: Partial<CompanyPayload>) =>
    apiClient.patch<Company>(`/companies/${id}`, payload),
};
