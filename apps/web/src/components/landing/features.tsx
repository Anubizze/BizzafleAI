const items = [
  {
    kicker: "Документы",
    title: "Договор читает юрист, а не шаблон",
    text: "Загрузите PDF или DOCX — получите риски, обязательства, штрафы и сроки со ссылками на пункты.",
  },
  {
    kicker: "Налоги",
    title: "Календарь, который не забывает",
    text: "Сроки ФНО, платежи и нагрузка собираются в одну ленту. Без таблиц «на память».",
  },
  {
    kicker: "Стратегия",
    title: "Цифры вместо вдохновения",
    text: "Health Check, SWOT и unit-экономика считают то, что влияет на прибыль, а не на слайды.",
  },
  {
    kicker: "Команда",
    title: "Три ответа. Одно резюме.",
    text: "Спросите всю команду — бухгалтер, юрист и консультант ответят параллельно.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-y border-line">
      <div className="mx-auto grid max-w-6xl gap-px bg-line px-0 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="bg-canvas px-8 py-14 sm:px-12">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{item.kicker}</p>
            <h3 className="display mt-4 text-3xl sm:text-4xl">{item.title}</h3>
            <p className="mt-4 max-w-md text-ink-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
