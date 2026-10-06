"use client";

import { useState } from "react";

const items = [
  {
    q: "Это заменяет бухгалтера и юриста?",
    a: "Нет. Bizaffle AI помогает быстрее разбирать вопросы, документы и цифры. Решения и официальные заключения остаются за лицензированными специалистами.",
  },
  {
    q: "Для какого права и каких налогов вы заточены?",
    a: "Продукт собран вокруг Казахстана: ИП, ТОО, налоговые режимы РК, типовые договоры и отчётность.",
  },
  {
    q: "Куда уходят документы?",
    a: "Файлы хранятся в вашем контуре компании и используются только для анализа. Доступ ограничен ролями.",
  },
  {
    q: "Можно ли работать всей командой?",
    a: "На BUSINESS и PRO — несколько пользователей, общая компания, история чатов и документов.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <h2 className="display text-5xl">FAQ</h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {items.map((item, i) => (
          <button
            key={item.q}
            type="button"
            onClick={() => setOpen(i === open ? -1 : i)}
            className="w-full py-6 text-left"
          >
            <p className="text-lg">{item.q}</p>
            {open === i ? <p className="mt-3 text-ink-muted">{item.a}</p> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
