"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { businessApi } from "@/lib/api/business";
import { ApiError } from "@/lib/api/client";
import { DEMO_CONSULT_NOTES, DEMO_HEALTH, DEMO_SWOT, DEMO_UNIT } from "@/lib/demo-data";
import type { BusinessHealth } from "@bizaffle/types";
import { useState } from "react";
import { toast } from "sonner";

const questions = [
  { id: "cash", label: "Запас денег, месяцы" },
  { id: "margin", label: "Валовая маржа, %" },
  { id: "tax", label: "Налоги сдаются вовремя? 1–5" },
  { id: "contracts", label: "Договоры проверены? 1–5" },
  { id: "focus", label: "Есть ли фокус на одном канале роста? 1–5" },
];

type Tool = "health" | "swot" | "unit" | "growth" | "plan" | "market";

function computeHealth(answers: Record<string, number>): BusinessHealth {
  const values = Object.values(answers);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const score = Math.round(Math.min(100, avg * 16 + (answers.cash ?? 0) * 3));
  return {
    score,
    label: score >= 75 ? "Устойчиво" : score >= 50 ? "Требует внимания" : "Хрупко",
    strengths: score >= 60 ? ["Есть базовая финансовая дисциплина"] : [],
    weaknesses: score < 70 ? ["Слабая предсказуемость денежного потока"] : [],
    risks: score < 55 ? ["Кассовый разрыв и налоговые сроки"] : ["Концентрация выручки"],
    recommendations: [
      "Закрепить календарь платежей",
      "Посчитать unit-экономику по главному продукту",
      "Проверить 3 ключевых договора",
    ],
  };
}

export function ConsultingView() {
  const [tool, setTool] = useState<Tool>("health");
  const [answers, setAnswers] = useState<Record<string, number>>({
    cash: 3,
    margin: 35,
    tax: 4,
    contracts: 3,
    focus: 3,
  });
  const [health, setHealth] = useState<BusinessHealth | null>(DEMO_HEALTH);
  const [swot, setSwot] = useState(DEMO_SWOT);
  const [unit, setUnit] = useState({ price: 50000, cogs: 18000, conversion: 3, traffic: 2000, cac: 12000, churn: 4 });
  const [unitOut, setUnitOut] = useState<Record<string, number> | null>(DEMO_UNIT);
  const [notes, setNotes] = useState(DEMO_CONSULT_NOTES);
  const [busy, setBusy] = useState(false);

  async function runHealth() {
    setBusy(true);
    const local = computeHealth(answers);
    try {
      const remote = await businessApi.healthCheck(answers);
      setHealth(remote);
    } catch (error) {
      setHealth(local);
      toast.message(error instanceof ApiError ? "Считаем локально: API недоступен" : "Локальный расчёт");
    } finally {
      setBusy(false);
    }
  }

  async function runUnit() {
    const margin = (unit.price - unit.cogs) / unit.price;
    const ltv = (unit.price * margin) / (unit.churn / 100);
    const ratio = unit.cac ? ltv / unit.cac : 0;
    const local = { margin: Math.round(margin * 100), ltv: Math.round(ltv), ratio: Number(ratio.toFixed(2)) };
    try {
      const remote = await businessApi.unitEconomics(unit);
      setUnitOut(remote);
    } catch {
      setUnitOut(local);
      toast.message("Unit-экономика посчитана локально");
    }
  }

  const tools: { id: Tool; label: string }[] = [
    { id: "health", label: "Health Check" },
    { id: "swot", label: "SWOT" },
    { id: "unit", label: "Unit-экономика" },
    { id: "growth", label: "Рост" },
    { id: "plan", label: "Бизнес-план" },
    { id: "market", label: "Рынок" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Айдана · Консалтинг</p>
        <h1 className="display mt-2 text-5xl">Инструменты, которые считают</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={`rounded-full border px-4 py-2 text-sm ${
              tool === item.id ? "border-accent bg-accent-soft" : "border-line"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tool === "health" && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4 rounded-[18px] border border-line p-6">
            {questions.map((q) => (
              <div key={q.id}>
                <Label>{q.label}</Label>
                <Input
                  type="number"
                  value={answers[q.id] ?? 0}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: Number(e.target.value) })}
                />
              </div>
            ))}
            <Button variant="accent" loading={busy} onClick={runHealth}>
              Рассчитать
            </Button>
          </div>
          <div className="rounded-[18px] border border-line p-6">
            {health ? (
              <>
                <p className="display text-7xl">{health.score}</p>
                <p className="mt-2 text-ink-muted">{health.label}</p>
                <List title="Сильные" items={health.strengths} />
                <List title="Слабые" items={health.weaknesses} />
                <List title="Риски" items={health.risks} />
                <List title="Рекомендации" items={health.recommendations} />
              </>
            ) : (
              <p className="text-ink-muted">Заполните форму — получите оценку и рекомендации.</p>
            )}
          </div>
        </section>
      )}

      {tool === "swot" && (
        <section className="grid gap-4 md:grid-cols-2">
          {(["s", "w", "o", "t"] as const).map((key) => (
            <div key={key} className="rounded-[16px] border border-line p-5">
              <Label>
                {key === "s" ? "Strengths" : key === "w" ? "Weaknesses" : key === "o" ? "Opportunities" : "Threats"}
              </Label>
              <Textarea value={swot[key]} onChange={(e) => setSwot({ ...swot, [key]: e.target.value })} />
            </div>
          ))}
          <Button
            variant="accent"
            onClick={async () => {
              try {
                await businessApi.swot(swot);
                toast.success("SWOT сохранён");
              } catch {
                toast.success("SWOT собран локально");
              }
            }}
          >
            Сохранить SWOT
          </Button>
        </section>
      )}

      {tool === "unit" && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-[18px] border border-line p-6">
            {Object.entries(unit).map(([key, value]) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setUnit({ ...unit, [key]: Number(e.target.value) })}
                />
              </div>
            ))}
            <Button variant="accent" onClick={runUnit}>
              Посчитать
            </Button>
          </div>
          <div className="rounded-[18px] border border-line p-6">
            {unitOut ? (
              <div className="space-y-3">
                <p>Маржа: {unitOut.margin}%</p>
                <p>LTV: {unitOut.ltv}</p>
                <p>LTV / CAC: {unitOut.ratio}</p>
              </div>
            ) : (
              <p className="text-ink-muted">Введите цифры продукта.</p>
            )}
          </div>
        </section>
      )}

      {(tool === "growth" || tool === "plan" || tool === "market") && (
        <section className="rounded-[18px] border border-line p-6">
          <Label>
            {tool === "growth"
              ? "Какой канал хотите масштабировать?"
              : tool === "plan"
                ? "Опишите продукт, рынок и цель на 12 месяцев"
                : "Кто клиент, кто конкурент, какая цена?"}
          </Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button
            className="mt-4"
            variant="accent"
            onClick={() =>
              toast.success("Черновик готов. Откройте чат Айданы, чтобы развить гипотезы.")
            }
          >
            Собрать каркас
          </Button>
          {notes ? (
            <div className="mt-6 space-y-2 text-sm text-ink-muted">
              <Badge>Черновик</Badge>
              <p>{notes}</p>
              <p>Следующий шаг: 3 эксперимента на 30 дней и одна метрика успеха.</p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-ink-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
