"use client";

import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api/dashboard";
import { DEMO_ACTIVITY, DEMO_OVERVIEW } from "@/lib/demo-data";
import { formatKzt, greetingForHour } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const overview = useQuery({ queryKey: ["overview"], queryFn: dashboardApi.overview, retry: 0 });
  const activity = useQuery({ queryKey: ["activity"], queryFn: dashboardApi.activity, retry: 0 });

  const data = overview.data?.attention?.length ? overview.data : DEMO_OVERVIEW;
  const name = data?.greetingName ?? user?.name ?? "коллега";
  const health = data?.health.score ?? 84;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Кабинет</p>
        <h1 className="display mt-2 text-5xl sm:text-6xl">
          {greetingForHour()}, {name.split(" ")[0]}
        </h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[18px] border border-line bg-canvas-elevated p-7">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Business Health</p>
          <div className="mt-6 flex items-end gap-4">
            <p className="display text-8xl leading-none">{health}</p>
            <p className="mb-2 text-ink-muted">/ 100 · {data?.health.label ?? "Устойчиво"}</p>
          </div>
          <p className="mt-6 max-w-md text-sm text-ink-muted">
            Оценка собирается из налогов, документов, календаря и unit-экономики. Это ориентир, не аудит.
          </p>
          <Link href="/dashboard/consulting" className="mt-6 inline-block text-sm underline underline-offset-4">
            Пройти Health Check
          </Link>
        </section>
        <section className="grid grid-cols-2 gap-3">
          <Metric label="Налоговые обязательства" value={formatKzt(data.taxLiability)} href="/dashboard/accounting" />
          <Metric label="Ближайшие сроки" value={String(data.upcomingDeadlines)} href="/dashboard/calendar" />
          <Metric label="Документы" value={String(data.documentsCount)} href="/dashboard/documents" />
          <Metric label="Баланс периода" value={formatKzt(data.financeBalance)} href="/dashboard/finance" />
        </section>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[18px] border border-line p-6">
          <h2 className="display text-3xl">Что требует внимания</h2>
          <div className="mt-5 space-y-3">
            {(data.attention ?? []).length === 0 ? (
              <p className="text-sm text-ink-muted">Сейчас критичных сигналов нет.</p>
            ) : (
              data.attention.map((item) => (
                <div key={item.id} className="rounded-[14px] border border-line px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p>{item.title}</p>
                    <Badge tone={item.tone === "danger" ? "danger" : item.tone === "warning" ? "warn" : "accent"}>
                      {item.tone}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{item.detail}</p>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-[18px] border border-line p-6">
          <h2 className="display text-3xl">Недавняя активность</h2>
          <div className="mt-5 space-y-3">
            {(activity.data?.length ? activity.data : DEMO_ACTIVITY).map((item) => (
              <div key={item.id} className="border-b border-line pb-3 last:border-0">
                <p>{item.title}</p>
                <p className="text-sm text-ink-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-[16px] border border-line bg-canvas-elevated p-5 transition hover:bg-canvas-muted/40">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
    </Link>
  );
}
