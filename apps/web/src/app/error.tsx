"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Ошибка</p>
        <h1 className="display mt-3 text-5xl">Что-то сломалось, но кабинет цел</h1>
        <p className="mt-4 text-ink-muted">Повторите действие. Если ошибка держится — обновите страницу.</p>
        <Button className="mt-8" variant="outline" onClick={reset}>
          Повторить
        </Button>
      </div>
    </main>
  );
}
