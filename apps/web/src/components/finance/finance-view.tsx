"use client";

import { businessApi } from "@/lib/api/business";
import { DEMO_METRICS } from "@/lib/demo-data";
import { formatKzt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FinanceView() {
  const metrics = useQuery({ queryKey: ["metrics"], queryFn: businessApi.metrics, retry: 0 });
  const rows = metrics.data?.length ? metrics.data : DEMO_METRICS;
  const income = rows.reduce((s, m) => s + m.income, 0);
  const expense = rows.reduce((s, m) => s + m.expense, 0);
  const last = rows[rows.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Финансы</p>
        <h1 className="display mt-2 text-5xl">Глубже, чем обзор</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Tile label="Доход за период" value={formatKzt(income)} />
        <Tile label="Расход за период" value={formatKzt(expense)} />
        <Tile label="Операционная прибыль" value={formatKzt(income - expense)} />
      </div>
      <section className="rounded-[18px] border border-line p-5">
        <h2 className="display text-3xl">По месяцам</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
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
              <Bar dataKey="income" fill="#7C5CFF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#5B8CFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      {last ? (
        <p className="text-sm text-ink-muted">
          Последний месяц {last.month}: доход {formatKzt(last.income)}, расход {formatKzt(last.expense)}.
        </p>
      ) : null}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line p-5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
    </div>
  );
}
