const rows = [
  {
    title: "ИП на упрощёнке",
    text: "Когда один человек отвечает за всё: налоги, акты, клиентские договоры и «а выгодно ли это».",
  },
  {
    title: "ТОО без штатного юриста",
    text: "Проверка контрагентов, поставки и трудовые — до того, как спор станет дороже абонентки.",
  },
  {
    title: "Финансовый директор на аутсорсе",
    text: "Сводка здоровья бизнеса, кассовые разрывы и приоритеты на месяц — в одном обзоре.",
  },
];

export function LandingBusiness() {
  return (
    <section id="business" className="mx-auto max-w-6xl px-5 py-28">
      <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Для бизнеса</p>
          <h2 className="display mt-4 text-5xl">Соберите кабинет, а не зоопарк сервисов</h2>
        </div>
        <div className="space-y-8">
          {rows.map((row, i) => (
            <div key={row.title} className="border-t border-line pt-8">
              <p className="text-xs text-ink-faint">0{i + 1}</p>
              <h3 className="mt-2 text-xl">{row.title}</h3>
              <p className="mt-2 text-ink-muted">{row.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
