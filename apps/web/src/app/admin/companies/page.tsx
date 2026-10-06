"use client";

import { AdminTable } from "@/components/admin/table-state";
import { adminApi } from "@/lib/api/admin";
import { DEMO_ADMIN_COMPANIES } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminCompaniesPage() {
  const q = useQuery({ queryKey: ["admin-companies"], queryFn: adminApi.companies, retry: 0 });
  const rows = q.data?.length ? q.data : DEMO_ADMIN_COMPANIES;
  return (
    <AdminTable
      title="Компании"
      loading={false}
      error={false}
      onRetry={() => q.refetch()}
      columns={["Название", "Тип", "БИН/ИИН", "Отрасль", "Создана"]}
      rows={rows.map((c) => [c.name, c.type, c.binIin, c.industry, formatDate(c.createdAt)])}
    />
  );
}
