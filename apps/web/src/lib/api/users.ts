import type { User } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const usersApi = {
  me: () => apiClient.get<User>("/users/me"),
  update: (payload: Partial<Pick<User, "name" | "phone" | "locale" | "avatarUrl">>) =>
    apiClient.patch<User>("/users/me", payload),
};
