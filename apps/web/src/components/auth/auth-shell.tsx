"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { t } from "@/lib/i18n";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grid-hairline absolute inset-0 opacity-60" />
        <Logo variant="lockup" />
        <div className="relative max-w-md">
          <p className="display text-6xl leading-[0.92]">{t("hero.title")}</p>
          <p className="mt-6 text-ink-muted">{t("hero.subtitle")}</p>
        </div>
        <p className="relative text-sm text-ink-faint">{t("auth.demo")}</p>
      </section>
      <section className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <ThemeToggle className="ml-auto" />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="display text-5xl">{title}</h1>
          <p className="mt-3 text-ink-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
