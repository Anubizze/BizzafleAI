import { DEMO_USER } from "@/lib/demo-data";
import { useAuthStore } from "@/stores/auth-store";

export function enterDemoSession() {
  useAuthStore.getState().setAuth(DEMO_USER, "demo-access-token");
}
