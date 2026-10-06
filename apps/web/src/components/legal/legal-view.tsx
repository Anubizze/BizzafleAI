"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_LEGAL_REVIEWS } from "@/lib/demo-data";
import Link from "next/link";

const templates = [
  { id: "service", name: "Договор услуг", hint: "Разовые и абонентские работы" },
  { id: "nda", name: "NDA", hint: "Конфиденциальность для подрядчика" },
  { id: "labor", name: "Трудовой договор", hint: "Штат, по нормам РК" },
  { id: "supply", name: "Поставка", hint: "Товар, сроки, приёмка" },
  { id: "act", name: "Акт выполненных работ", hint: "Закрытие периода" },
];

const questions = [
  "Какие пункты чаще всего оспаривают в договоре услуг?",
  "Можно ли удержать оплату при просрочке акта?",
  "Что обязательно указать в трудовом договоре РК?",
];

export function LegalView() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Айдана · Право</p>
          <h1 className="display mt-2 text-5xl">Договоры до подписи, не после суда</h1>
        </div>
        <Link href="/dashboard/ai/lawyer">
          <Button variant="accent">Задать юридический вопрос</Button>
        </Link>
      </div>
      <section>
        <h2 className="display text-3xl">Шаблоны</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {templates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/dashboard/ai/lawyer?q=${encodeURIComponent(`Подготовь шаблон: ${tpl.name}`)}`}
              className="rounded-[16px] border border-line p-5 hover:bg-canvas-muted/40"
            >
              <p>{tpl.name}</p>
              <p className="mt-2 text-sm text-ink-muted">{tpl.hint}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[18px] border border-line p-6">
          <h2 className="display text-3xl">Частые вопросы</h2>
          <div className="mt-4 space-y-2">
            {questions.map((q) => (
              <Link
                key={q}
                href={`/dashboard/ai/lawyer`}
                className="block rounded-[14px] border border-line px-4 py-3 text-sm text-ink-muted hover:text-ink"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[18px] border border-line p-6">
          <h2 className="display text-3xl">История проверок</h2>
          <div className="mt-4 space-y-3">
            {DEMO_LEGAL_REVIEWS.map((item) => (
              <div key={item.name} className="rounded-[14px] border border-line px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p>{item.name}</p>
                  <Badge tone={item.risk === "HIGH" ? "danger" : item.risk === "MEDIUM" ? "warn" : "ok"}>
                    {item.risk}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{item.note}</p>
                <p className="mt-1 text-xs text-ink-faint">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
