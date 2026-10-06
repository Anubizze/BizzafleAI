"use client";

import { AdminTable } from "@/components/admin/table-state";
import { adminApi } from "@/lib/api/admin";
import { DEMO_AI_REQUESTS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminAiRequestsPage() {
  const q = useQuery({ queryKey: ["admin-ai"], queryFn: adminApi.aiRequests, retry: 0 });
  const rows = q.data?.length ? q.data : DEMO_AI_REQUESTS;
  return (
    <AdminTable
      title="AI-запросы"
      loading={false}
      error={false}
      onRetry={() => q.refetch()}
      columns={["Пользователь", "Агент", "Дата"]}
      rows={rows.map((r) => [r.userEmail, r.agentSlug, formatDate(r.createdAt)])}
    />
  );
}
