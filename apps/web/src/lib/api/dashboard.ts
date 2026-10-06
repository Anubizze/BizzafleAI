import type { DashboardOverview } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
}

export const dashboardApi = {
  overview: () => apiClient.get<DashboardOverview>("/dashboard/overview"),
  activity: () => apiClient.get<ActivityItem[]>("/dashboard/activity"),
};
