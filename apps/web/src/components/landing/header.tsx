"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-mode";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#product", key: "nav.product" },
  { href: "#features", key: "nav.features" },
  { href: "#team", key: "nav.team" },
  { href: "#business", key: "nav.business" },
  { href: "#pricing", key: "nav.pricing" },
  { href: "#faq", key: "nav.faq" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition duration-300",
        scrolled ? "glass border-b border-line" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-muted lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-ink">
              {t(link.key)}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link href={isDemoMode ? "/dashboard" : "/login"}>
            <Button variant="ghost">{isDemoMode ? "Кабинет" : t("nav.login")}</Button>
          </Link>
          <Link href={isDemoMode ? "/dashboard" : "/register"}>
            <Button variant="accent">{isDemoMode ? "Открыть демо" : t("nav.start")}</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line bg-canvas px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {t(link.key)}
              </a>
            ))}
            <Link href={isDemoMode ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>
              {isDemoMode ? "Кабинет" : t("nav.login")}
            </Link>
            <Link href={isDemoMode ? "/dashboard" : "/register"} onClick={() => setOpen(false)}>
              <Button variant="accent" className="w-full">
                {t("nav.start")}
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
