"use client";

import { AuthGuard } from "@/components/dashboard/auth-guard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  return (
    <AuthGuard>
      {!hydrated ? null : user?.role === "ADMIN" ? (
        children
      ) : (
        <main className="grid min-h-dvh place-items-center px-6">
          <div className="max-w-md text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">403</p>
            <h1 className="display mt-3 text-5xl">Доступ только для администраторов</h1>
            <p className="mt-4 text-ink-muted">
              Эта зона видит пользователей, выручку и системное здоровье. Обычный кабинет — по ссылке ниже.
            </p>
            <Link href="/dashboard" className="mt-8 inline-block">
              <Button variant="outline">В кабинет</Button>
            </Link>
          </div>
        </main>
      )}
    </AuthGuard>
  );
}
