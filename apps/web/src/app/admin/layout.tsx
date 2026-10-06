"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/companies", label: "Компании" },
  { href: "/admin/subscriptions", label: "Подписки" },
  { href: "/admin/ai-requests", label: "AI-запросы" },
  { href: "/admin/documents", label: "Документы" },
  { href: "/admin/revenue", label: "Выручка" },
  { href: "/admin/system", label: "System Health" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminGuard>
      <div className="min-h-dvh">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-6">
            <Logo href="/admin" />
            <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">Admin</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">
          <nav className="hidden w-48 shrink-0 flex-col gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[12px] px-3 py-2 text-sm text-ink-muted hover:bg-canvas-muted",
                  pathname === link.href && "bg-canvas-muted text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </AdminGuard>
  );
}
