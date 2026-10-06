"use client";

import { AuthGuard } from "@/components/dashboard/auth-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Sheet } from "@/components/ui/sheet";
import { companiesApi } from "@/lib/api/companies";
import { DEMO_COMPANY } from "@/lib/demo-data";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { data: company } = useQuery({
    queryKey: ["company-me"],
    queryFn: companiesApi.me,
    retry: 0,
  });

  return (
    <AuthGuard>
      <div className="flex min-h-dvh bg-canvas">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>
        <Sheet open={mobile} onClose={() => setMobile(false)} side="left" title="Навигация" className="p-0">
          <div className="-m-5 h-[calc(100%+40px)]">
            <Sidebar collapsed={false} onToggle={() => setMobile(false)} onNavigate={() => setMobile(false)} />
          </div>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar companyName={company?.name ?? DEMO_COMPANY.name} onMenu={() => setMobile(true)} />
          <div className="flex-1 px-4 py-6 lg:px-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
