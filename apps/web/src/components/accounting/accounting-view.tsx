"use client";

import { businessApi } from "@/lib/api/business";
import { calendarApi } from "@/lib/api/calendar";
import { dashboardApi } from "@/lib/api/dashboard";
import { DEMO_EVENTS, DEMO_METRICS, DEMO_OVERVIEW } from "@/lib/demo-data";
import { formatDate, formatKzt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AccountingView() {
  const overview = useQuery({ queryKey: ["overview"], queryFn: dashboardApi.overview, retry: 0 });
  const metrics = useQuery({ queryKey: ["metrics"], queryFn: businessApi.metrics, retry: 0 });
  const events = useQuery({ queryKey: ["calendar"], queryFn: () => calendarApi.list(), retry: 0 });

  const ov = overview.data ?? DEMO_OVERVIEW;
  const mets = metrics.data?.length ? metrics.data : DEMO_METRICS;
  const evs = events.data?.length ? events.data : DEMO_EVENTS;
  const upcoming = evs.filter((e) => e.type === "PAYMENT" || e.type === "TAX").slice(0, 4);
  const nextReport = evs.find((e) => e.type === "REPORT");
  const income = mets.reduce((s, m) => s + m.income, 0);
  const expense = mets.reduce((s, m) => s + m.expense, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Айдана · Бухгалтерия</p>
        <h1 className="display mt-2 text-5xl">Налоги без сюрпризов</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Ближайшие платежи" value={String(upcoming.length)} />
        <Stat label="Следующий отчёт" value={nextReport ? formatDate(nextReport.date) : "—"} />
        <Stat label="Налоговая нагрузка" value={formatKzt(ov.taxLiability)} />
        <Stat label="Доход периода" value={formatKzt(income)} />
        <Stat label="Расход периода" value={formatKzt(expense)} />
      </div>
      <section className="rounded-[18px] border border-line p-5">
        <h2 className="display text-3xl">Доходы и расходы</h2>
        <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mets}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--fg-faint)" fontSize={12} />
                <YAxis stroke="var(--fg-faint)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#7C5CFF" fill="rgba(124,92,255,0.15)" />
                <Area type="monotone" dataKey="expense" stroke="#5B8CFF" fill="rgba(91,140,255,0.12)" />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-[18px] border border-line p-5">
        <h2 className="display text-3xl">Обязательства</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">Ближайших платежей нет или календарь ещё пуст.</p>
          ) : (
            upcoming.map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
                <div>
                  <p>{event.title}</p>
                  <p className="text-sm text-ink-muted">{formatDate(event.date)}</p>
                </div>
                <p className="text-sm">{event.amount ? formatKzt(event.amount) : event.type}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-canvas-elevated p-5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="display mt-3 text-2xl">{value}</p>
    </div>
  );
}
