"use client";

import { bottomNav, mainNav } from "@/components/dashboard/nav";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-line bg-canvas-elevated transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      <div className="flex h-[72px] items-center justify-between px-3">
        <Logo href="/dashboard" compact={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          className="hidden size-8 place-items-center rounded-full border border-line text-ink-muted lg:grid"
        >
          <ChevronLeft className={cn("size-4 transition", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-3">
        {mainNav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition",
                active ? "bg-canvas-muted text-ink" : "text-ink-muted hover:bg-canvas-muted/60 hover:text-ink",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {collapsed ? null : item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-line px-3 py-3">
        {bottomNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-ink-muted hover:bg-canvas-muted/60 hover:text-ink",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {collapsed ? null : item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
