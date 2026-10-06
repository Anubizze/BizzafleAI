"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companiesApi } from "@/lib/api/companies";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import type { BusinessType, PrimaryGoal, TaxRegime } from "@bizaffle/types";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const industries = [
  "IT и разработка",
  "Торговля",
  "Услуги",
  "Строительство",
  "Производство",
  "Образование",
  "Медицина",
  "Логистика",
  "Другое",
];

interface Draft {
  type: BusinessType | "";
  name: string;
  binIin: string;
  industry: string;
  taxRegime: TaxRegime | "";
  employeeCount: number;
  primaryGoal: PrimaryGoal | "";
}

const empty: Draft = {
  type: "",
  name: "",
  binIin: "",
  industry: "",
  taxRegime: "",
  employeeCount: 1,
  primaryGoal: "",
};

function Choice({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[16px] border px-5 py-4 text-left transition duration-300 ${
        selected ? "border-accent bg-accent-soft" : "border-line hover:bg-canvas-muted/50"
      }`}
    >
      <p className="text-[15px] font-medium">{label}</p>
      {hint ? <p className="mt-1 text-sm text-ink-muted">{hint}</p> : null}
    </button>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [saving, setSaving] = useState(false);

  const total = 8;
  const progress = ((step + 1) / total) * 100;

  function canNext() {
    if (step === 0) return Boolean(draft.type);
    if (step === 1) return draft.name.trim().length > 1;
    if (step === 2) return draft.binIin.trim().length >= 10;
    if (step === 3) return Boolean(draft.industry);
    if (step === 4) return Boolean(draft.taxRegime);
    if (step === 5) return draft.employeeCount > 0;
    if (step === 6) return Boolean(draft.primaryGoal);
    return true;
  }

  function next() {
    if (!canNext()) {
      toast.error("Заполните этот шаг, чтобы продолжить");
      return;
    }
    setStep((s) => Math.min(s + 1, total - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    if (!draft.type || !draft.taxRegime || !draft.primaryGoal) {
      toast.error("Заполните все шаги");
      return;
    }
    setSaving(true);
    try {
      await companiesApi.create({
        name: draft.name,
        type: draft.type,
        binIin: draft.binIin,
        industry: draft.industry,
        taxRegime: draft.taxRegime,
        employeeCount: draft.employeeCount,
        primaryGoal: draft.primaryGoal,
      });
      if (user) setUser({ ...user, onboardingCompleted: true });
      toast.success("Компания создана");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось сохранить компанию");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-10">
      <div className="mb-10">
        <div className="h-px overflow-hidden bg-line">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-faint">
          Шаг {Math.min(step + 1, 7)} из 7
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className="flex-1"
        >
          {step === 0 && (
            <>
              <h1 className="display text-5xl">Какой у вас бизнес?</h1>
              <p className="mt-3 text-ink-muted">От этого зависят налоги, отчётность и шаблоны.</p>
              <div className="mt-8 grid gap-3">
                <Choice
                  label="ИП"
                  hint="Индивидуальный предприниматель"
                  selected={draft.type === "IP"}
                  onClick={() => setDraft({ ...draft, type: "IP" })}
                />
                <Choice
                  label="ТОО"
                  hint="Товарищество с ограниченной ответственностью"
                  selected={draft.type === "TOO"}
                  onClick={() => setDraft({ ...draft, type: "TOO" })}
                />
                <Choice
                  label="Другое"
                  hint="Филиал, совместное предприятие, иная форма"
                  selected={draft.type === "OTHER"}
                  onClick={() => setDraft({ ...draft, type: "OTHER" })}
                />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="display text-5xl">Как называется компания?</h1>
              <p className="mt-3 text-ink-muted">Так команда будет обращаться к вашему делу.</p>
              <Input
                className="mt-8"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Например, ТОО «Астана Логистик»"
              />
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="display text-5xl">БИН или ИИН</h1>
              <p className="mt-3 text-ink-muted">Нужен для сверки обязательств и шаблонов.</p>
              <Input
                className="mt-8"
                value={draft.binIin}
                onChange={(e) => setDraft({ ...draft, binIin: e.target.value })}
                placeholder="12 цифр"
              />
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="display text-5xl">Отрасль</h1>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {industries.map((item) => (
                  <Choice
                    key={item}
                    label={item}
                    selected={draft.industry === item}
                    onClick={() => setDraft({ ...draft, industry: item })}
                  />
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="display text-5xl">Налоговый режим</h1>
              <div className="mt-8 grid gap-3">
                {(
                  [
                    ["SIMPLIFIED", "Упрощённая декларация"],
                    ["GENERAL", "Общеустановленный"],
                    ["PATENT", "Патент"],
                    ["RETAIL_TAX", "Розничный налог"],
                    ["OTHER", "Другой / не уверен"],
                  ] as const
                ).map(([value, label]) => (
                  <Choice
                    key={value}
                    label={label}
                    selected={draft.taxRegime === value}
                    onClick={() => setDraft({ ...draft, taxRegime: value })}
                  />
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h1 className="display text-5xl">Сколько сотрудников?</h1>
              <Input
                className="mt-8"
                type="number"
                min={1}
                value={draft.employeeCount}
                onChange={(e) => setDraft({ ...draft, employeeCount: Number(e.target.value) || 1 })}
              />
            </>
          )}
          {step === 6 && (
            <>
              <h1 className="display text-5xl">Главная цель</h1>
              <div className="mt-8 grid gap-3">
                {(
                  [
                    ["ACCOUNTING", "Навести порядок в налогах"],
                    ["LEGAL", "Закрыть юридические риски"],
                    ["MANAGEMENT", "Понять экономику и рост"],
                    ["ALL", "Всё сразу — команда целиком"],
                  ] as const
                ).map(([value, label]) => (
                  <Choice
                    key={value}
                    label={label}
                    selected={draft.primaryGoal === value}
                    onClick={() => setDraft({ ...draft, primaryGoal: value })}
                  />
                ))}
              </div>
            </>
          )}
          {step === 7 && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Готово</p>
              <h1 className="display mt-4 text-5xl sm:text-6xl">Айдана уже в кабинете</h1>
              <p className="mx-auto mt-4 max-w-md text-ink-muted">
                Она знает контекст {draft.name || "вашей компании"} и закрывает бухгалтерию,
                право и консультации.
              </p>
              <div className="mx-auto mt-10 max-w-sm rounded-[16px] border border-line px-4 py-6">
                <p className="display text-3xl">Айдана</p>
                <p className="mt-1 text-sm text-ink-muted">Бухгалтер · Юрист · Консультант</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          Назад
        </Button>
        {step < 7 ? (
          <Button variant="accent" onClick={next} disabled={!canNext()}>
            Далее
          </Button>
        ) : (
          <Button variant="accent" loading={saving} onClick={finish}>
            Перейти в кабинет
          </Button>
        )}
      </div>
    </main>
  );
}
