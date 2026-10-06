"use client";

import { adminApi } from "@/lib/api/admin";
import { DEMO_REVENUE } from "@/lib/demo-data";
import { formatKzt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminRevenuePage() {
  const q = useQuery({ queryKey: ["admin-revenue"], queryFn: adminApi.revenue, retry: 0 });
  const points = q.data?.length ? q.data : DEMO_REVENUE;
  const total = points.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h1 className="display text-5xl">Выручка</h1>
      <p className="mt-3 text-ink-muted">Сумма периода: {formatKzt(total)}</p>
      <div className="mt-8 h-80 rounded-[18px] border border-line p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <XAxis dataKey="month" stroke="var(--fg-faint)" fontSize={12} />
            <YAxis stroke="var(--fg-faint)" fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey="amount" stroke="#7C5CFF" fill="rgba(124,92,255,0.16)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
