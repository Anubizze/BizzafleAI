import type { NotificationItem } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const notificationsApi = {
  list: () => apiClient.get<NotificationItem[]>("/notifications"),
  markRead: (id: string) => apiClient.patch<NotificationItem>(`/notifications/${id}/read`),
  markAll: () => apiClient.post<{ ok: boolean }>("/notifications/read-all"),
};
