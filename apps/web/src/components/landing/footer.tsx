import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            AI-команда для бизнеса в Казахстане. Не является лицензированным консультантом,
            аудитором или юридической фирмой.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink-muted">
          <Link href="/pricing">Тарифы</Link>
          <Link href="/dashboard">Демо-кабинет</Link>
        </div>
      </div>
    </footer>
  );
}
