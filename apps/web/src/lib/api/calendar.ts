import type { CalendarEvent } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const calendarApi = {
  list: (month?: string) => {
    if (!month) return apiClient.get<CalendarEvent[]>("/calendar");
    const [year, m] = month.split("-").map(Number);
    const from = new Date(Date.UTC(year, (m || 1) - 1, 1)).toISOString();
    const to = new Date(Date.UTC(year, m || 1, 0, 23, 59, 59)).toISOString();
    return apiClient.get<CalendarEvent[]>(`/calendar?from=${from}&to=${to}`);
  },
  create: (payload: Omit<CalendarEvent, "id">) =>
    apiClient.post<CalendarEvent>("/calendar", payload),
};
