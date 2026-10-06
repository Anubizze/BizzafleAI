"use client";

import { capabilitiesFor } from "@/lib/agents";
import { motion } from "framer-motion";

const lenses = [
  { slug: "accountant" as const, title: "Бухгалтер", color: "#7C5CFF" },
  { slug: "lawyer" as const, title: "Юрист", color: "#5B8CFF" },
  { slug: "consultant" as const, title: "Консультант", color: "#C084FC" },
];

export function LandingTeam() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-5 py-28">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Айдана</p>
      <h2 className="display mt-4 max-w-3xl text-5xl sm:text-6xl">
        Один специалист. Три компетенции.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-ink-muted">
        Айдана — AI-ассистент Bizaffle. Она считает налоги, читает договоры и помогает с
        решениями по бизнесу. Не три бота — одна голова.
      </p>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {lenses.map((lens, i) => (
          <motion.div
            key={lens.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-[18px] border border-line bg-canvas-elevated p-7"
          >
            <span className="mb-8 block h-px w-10" style={{ background: lens.color }} />
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Айдана как</p>
            <h3 className="display mt-2 text-4xl">{lens.title}</h3>
            <ul className="mt-7 space-y-2.5 text-sm text-ink-muted">
              {capabilitiesFor(lens.slug).map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
