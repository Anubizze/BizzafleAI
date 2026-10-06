import type { AdminStats, Company, DocumentItem, Subscription, User } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export interface AdminAiRequest {
  id: string;
  userEmail: string;
  agentSlug: string;
  createdAt: string;
  tokens?: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface SystemHealth {
  api: "ok" | "degraded" | "down";
  db: "ok" | "degraded" | "down";
  redis: "ok" | "degraded" | "down";
  ai: "ok" | "degraded" | "down";
}

export const adminApi = {
  stats: () => apiClient.get<AdminStats>("/admin/stats"),
  users: () => apiClient.get<User[]>("/admin/users"),
  companies: () => apiClient.get<Company[]>("/admin/companies"),
  subscriptions: () => apiClient.get<Subscription[]>("/admin/subscriptions"),
  aiRequests: () => apiClient.get<AdminAiRequest[]>("/admin/ai-requests"),
  documents: () => apiClient.get<DocumentItem[]>("/admin/documents"),
  revenue: () => apiClient.get<RevenuePoint[]>("/admin/revenue"),
  health: () => apiClient.get<SystemHealth>("/admin/health"),
};
