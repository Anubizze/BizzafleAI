"use client";

import { AdminTable } from "@/components/admin/table-state";
import { adminApi } from "@/lib/api/admin";
import { DEMO_ADMIN_USERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminUsersPage() {
  const q = useQuery({ queryKey: ["admin-users"], queryFn: adminApi.users, retry: 0 });
  const rows = q.data?.length ? q.data : DEMO_ADMIN_USERS;
  return (
    <AdminTable
      title="Пользователи"
      loading={false}
      error={false}
      onRetry={() => q.refetch()}
      columns={["Имя", "Email", "Роль", "Создан"]}
      rows={rows.map((u) => [u.name, u.email, u.role, formatDate(u.createdAt)])}
    />
  );
}
