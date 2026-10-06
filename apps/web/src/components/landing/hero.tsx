"use client";

import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-mode";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";

const TeamScene = dynamic(
  () => import("@/components/three/team-scene").then((m) => m.TeamScene),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[420px] place-items-center text-sm text-ink-faint lg:h-[560px]">
        Собираем команду…
      </div>
    ),
  },
);

export function LandingHero() {
  return (
    <section id="product" className="relative overflow-hidden pt-28 lg:pt-32">
      <div className="grid-hairline pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-ink-faint">
            Legaltech · Fintech · Казахстан
          </p>
          <h1 className="display mt-5 max-w-xl text-[52px] leading-[0.92] sm:text-[72px] lg:text-[80px]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={isDemoMode ? "/dashboard" : "/register"}>
              <Button variant="accent" size="lg">
                {t("hero.cta")}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                {t("hero.secondary")}
              </Button>
            </a>
          </div>
          <p className="mt-8 max-w-md text-xs leading-relaxed text-ink-faint">
            {t("hero.disclaimer")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_68%)] blur-2xl" />
          <TeamScene />
        </motion.div>
      </div>
    </section>
  );
}
