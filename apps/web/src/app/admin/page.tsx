"use client";

import { adminApi } from "@/lib/api/admin";
import { DEMO_ADMIN_STATS } from "@/lib/demo-data";
import { formatKzt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminHomePage() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: adminApi.stats, retry: 0 });
  const s = stats.data ?? DEMO_ADMIN_STATS;
  const cards = [
    { label: "Total Users", value: s?.totalUsers ?? 0 },
    { label: "Active Companies", value: s?.activeCompanies ?? 0 },
    { label: "AI Requests", value: s?.aiRequests ?? 0 },
    { label: "MRR", value: formatKzt(s?.mrr ?? 0) },
  ];

  return (
    <div>
      <h1 className="display text-5xl">Система</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[16px] border border-line p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">{card.label}</p>
            <p className="display mt-3 text-4xl">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
