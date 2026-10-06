import type { User } from "@bizaffle/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const AUTH_COOKIE = "bizaffle-auth";

function writeAuthCookie(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) {
    document.cookie = `${AUTH_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  hydrated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User | null) => void;
  setToken: (accessToken: string | null) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setAuth: (user, accessToken) => {
        writeAuthCookie(true);
        set({ user, accessToken });
      },
      setUser: (user) => set({ user }),
      setToken: (accessToken) => {
        writeAuthCookie(Boolean(accessToken));
        set({ accessToken });
      },
      setHydrated: (hydrated) => set({ hydrated }),
      logout: () => {
        writeAuthCookie(false);
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "bizaffle-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        writeAuthCookie(Boolean(state?.accessToken));
      },
    },
  ),
);

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().accessToken;
}
