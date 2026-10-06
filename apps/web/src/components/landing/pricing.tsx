"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    id: "START",
    name: "START",
    price: "0 ₸",
    note: "14 дней, затем 9 900 ₸ / мес",
    points: ["1 компания", "AI-команда с лимитом", "Документы: 20 / мес", "Календарь обязательств"],
  },
  {
    id: "BUSINESS",
    name: "BUSINESS",
    price: "29 900 ₸",
    note: "Для растущих ИП и ТОО",
    featured: true,
    points: ["До 5 пользователей", "Без жёсткого лимита чатов", "Проверка договоров", "Health Check и финансы"],
  },
  {
    id: "PRO",
    name: "PRO",
    price: "79 900 ₸",
    note: "Команда и приоритет",
    points: ["Безлимит документов", "Командный режим", "Приоритетная очередь AI", "Админ-контроль"],
  },
];

export function LandingPricing({
  ctaHref = "/register",
  onSelect,
}: {
  ctaHref?: string;
  onSelect?: (plan: "START" | "BUSINESS" | "PRO") => void;
}) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-28">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Тарифы</p>
      <h2 className="display mt-4 text-5xl">Прозрачно. Без «от 1$».</h2>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col rounded-[18px] border border-line bg-canvas-elevated p-7",
              plan.featured && "lg:-translate-y-3 lg:shadow-[var(--shadow-lift)]",
            )}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">{plan.name}</p>
            <p className="display mt-5 text-5xl">{plan.price}</p>
            <p className="mt-2 text-sm text-ink-muted">{plan.note}</p>
            <ul className="mt-8 flex-1 space-y-2 text-sm text-ink-muted">
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {onSelect ? (
              <Button
                className="mt-8 w-full"
                variant={plan.featured ? "accent" : "outline"}
                onClick={() => onSelect(plan.id as "START" | "BUSINESS" | "PRO")}
              >
                Выбрать {plan.name}
              </Button>
            ) : (
              <Link href={ctaHref} className="mt-8">
                <Button variant={plan.featured ? "accent" : "outline"} className="w-full">
                  Выбрать {plan.name}
                </Button>
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
