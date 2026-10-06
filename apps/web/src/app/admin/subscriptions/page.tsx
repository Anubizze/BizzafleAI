"use client";

import { AdminTable } from "@/components/admin/table-state";
import { adminApi } from "@/lib/api/admin";
import { DEMO_ADMIN_SUBS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminSubscriptionsPage() {
  const q = useQuery({ queryKey: ["admin-subs"], queryFn: adminApi.subscriptions, retry: 0 });
  const rows = q.data?.length ? q.data : DEMO_ADMIN_SUBS;
  return (
    <AdminTable
      title="Подписки"
      loading={false}
      error={false}
      onRetry={() => q.refetch()}
      columns={["ID", "План", "Статус", "До"]}
      rows={rows.map((s) => [s.id.slice(0, 8), s.plan, s.status, formatDate(s.periodEnd)])}
    />
  );
}
