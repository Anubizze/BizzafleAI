"use client";

import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api/admin";
import { DEMO_HEALTH_SYS } from "@/lib/demo-data";
import { useQuery } from "@tanstack/react-query";

export default function AdminSystemPage() {
  const q = useQuery({ queryKey: ["admin-health"], queryFn: adminApi.health, retry: 0 });
  const health = q.data ?? DEMO_HEALTH_SYS;

  return (
    <div>
      <h1 className="display text-5xl">System Health</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {health
          ? Object.entries(health).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-[16px] border border-line px-5 py-4">
                <p className="uppercase tracking-[0.14em] text-ink-faint">{key}</p>
                <Badge tone={value === "ok" ? "ok" : value === "degraded" ? "warn" : "danger"}>{value}</Badge>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
