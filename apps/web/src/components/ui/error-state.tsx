"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Не удалось загрузить",
  description = "Сервис временно недоступен. Данные не потеряны — повторите запрос.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-line bg-canvas-elevated px-8 py-12 text-center">
      <p className="display text-3xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-ink-muted">{description}</p>
      {onRetry ? (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      ) : null}
    </div>
  );
}
