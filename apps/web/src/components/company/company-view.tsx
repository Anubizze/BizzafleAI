"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { companiesApi, type CompanyPayload } from "@/lib/api/companies";
import { ApiError } from "@/lib/api/client";
import { DEMO_COMPANY } from "@/lib/demo-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const fromCompany = (c: typeof DEMO_COMPANY): CompanyPayload => ({
  name: c.name,
  type: c.type,
  binIin: c.binIin,
  industry: c.industry,
  taxRegime: c.taxRegime,
  employeeCount: c.employeeCount,
  primaryGoal: c.primaryGoal,
});

export function CompanyView() {
  const qc = useQueryClient();
  const company = useQuery({ queryKey: ["company-me"], queryFn: companiesApi.me, retry: 0 });
  const [form, setForm] = useState<CompanyPayload>(fromCompany(DEMO_COMPANY));

  useEffect(() => {
    if (company.data) setForm(fromCompany(company.data));
  }, [company.data]);

  const save = useMutation({
    mutationFn: () => companiesApi.update(company.data?.id ?? DEMO_COMPANY.id, form),
    onSuccess: () => {
      toast.success("Компания обновлена");
      qc.invalidateQueries({ queryKey: ["company-me"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Не удалось сохранить"),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Компания</p>
        <h1 className="display mt-2 text-5xl">Карточка дела</h1>
      </div>
      <div>
        <Label>Название</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>БИН / ИИН</Label>
        <Input value={form.binIin} onChange={(e) => setForm({ ...form, binIin: e.target.value })} />
      </div>
      <div>
        <Label>Отрасль</Label>
        <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
      </div>
      <div>
        <Label>Тип</Label>
        <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CompanyPayload["type"] })}>
          <option value="IP">ИП</option>
          <option value="TOO">ТОО</option>
          <option value="OTHER">Другое</option>
        </Select>
      </div>
      <div>
        <Label>Налоговый режим</Label>
        <Select
          value={form.taxRegime}
          onChange={(e) => setForm({ ...form, taxRegime: e.target.value as CompanyPayload["taxRegime"] })}
        >
          <option value="SIMPLIFIED">Упрощёнка</option>
          <option value="GENERAL">Общеустановленный</option>
          <option value="PATENT">Патент</option>
          <option value="RETAIL_TAX">Розничный налог</option>
          <option value="OTHER">Другое</option>
        </Select>
      </div>
      <div>
        <Label>Сотрудники</Label>
        <Input
          type="number"
          value={form.employeeCount}
          onChange={(e) => setForm({ ...form, employeeCount: Number(e.target.value) })}
        />
      </div>
      <Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>
        Сохранить
      </Button>
    </div>
  );
}
