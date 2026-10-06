"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authApi } from "@/lib/api/auth";
import { notificationsApi } from "@/lib/api/notifications";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { initials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Topbar({
  companyName,
  onMenu,
}: {
  companyName?: string;
  onMenu: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const { data: notes } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    retry: 0,
  });
  const unread = (notes?.length ? notes : DEMO_NOTIFICATIONS).filter((n) => !n.read).length;

  async function signOut() {
    try {
      await authApi.logout();
    } catch {
      // still leave locally
    }
    logout();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-line px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-line lg:hidden"
          onClick={onMenu}
        >
          <Menu className="size-4" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Компания</p>
          <p className="text-sm">{companyName ?? "Bizaffle"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/dashboard/notifications"
          className="relative grid size-10 place-items-center rounded-full border border-line"
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
          ) : null}
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line text-xs"
          >
            {initials(user?.name ?? "U")}
          </button>
          {open ? (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-[14px] border border-line bg-canvas-elevated p-2 shadow-[var(--shadow)]">
              <Link
                href="/dashboard/profile"
                className="block rounded-[10px] px-3 py-2 text-sm hover:bg-canvas-muted"
                onClick={() => setOpen(false)}
              >
                Профиль
              </Link>
              <button
                type="button"
                className="block w-full rounded-[10px] px-3 py-2 text-left text-sm hover:bg-canvas-muted"
                onClick={() => {
                  setOpen(false);
                  setConfirm(true);
                }}
              >
                Выйти
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Выйти?"
        description="Сессия будет завершена на этом устройстве."
        confirmLabel="Выйти"
        onConfirm={signOut}
      />
    </header>
  );
}
