import type { AuthPayload } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthPayload>("/auth/login", { email, password }, { auth: false }),
  register: (payload: { name: string; email: string; phone?: string; password: string }) =>
    apiClient.post<AuthPayload>("/auth/register", payload, { auth: false }),
  forgotPassword: (email: string) =>
    apiClient.post<{ ok: boolean }>("/auth/forgot-password", { email }, { auth: false }),
  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout"),
  refresh: () => apiClient.post<AuthPayload>("/auth/refresh", undefined, { auth: false }),
};
