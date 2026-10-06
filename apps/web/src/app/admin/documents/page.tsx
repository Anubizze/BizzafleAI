"use client";

import { AdminTable } from "@/components/admin/table-state";
import { adminApi } from "@/lib/api/admin";
import { DEMO_DOCUMENTS } from "@/lib/demo-data";
import { formatBytes, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminDocumentsPage() {
  const q = useQuery({ queryKey: ["admin-docs"], queryFn: adminApi.documents, retry: 0 });
  const rows = q.data?.length ? q.data : DEMO_DOCUMENTS;
  return (
    <AdminTable
      title="Документы"
      loading={false}
      error={false}
      onRetry={() => q.refetch()}
      columns={["Имя", "Категория", "AI", "Размер", "Дата"]}
      rows={rows.map((d) => [d.name, d.category, d.aiStatus, formatBytes(d.size), formatDate(d.uploadedAt)])}
    />
  );
}
