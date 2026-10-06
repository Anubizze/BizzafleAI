import { AI_AGENTS, type AgentSlug } from "@bizaffle/types";

export const TEAM_SLUG: AgentSlug = "team";

export const agentVisuals: Record<
  Exclude<AgentSlug, "team">,
  { material: "glass" | "steel" | "amethyst"; accent: string }
> = {
  accountant: { material: "glass", accent: "#7C5CFF" },
  lawyer: { material: "steel", accent: "#5B8CFF" },
  consultant: { material: "amethyst", accent: "#C084FC" },
};

export const agentCapabilities: Record<Exclude<AgentSlug, "team">, string[]> = {
  accountant: [
    "Налоговые режимы РК: упрощёнка, общеустановленный, патент, розничный налог",
    "Календарь сдачи отчётности и платежные сроки",
    "Расчёт налоговой нагрузки и сверка обязательств",
    "Доходы, расходы, акты сверки и первичка",
    "Подсказки по ФНО, СОНО и кассовым разрывам",
    "Разбор писем и требований налоговой",
  ],
  lawyer: [
    "Проверка договоров на риски, штрафы и односторонние условия",
    "Трудовые, лицензионные и поставки — по нормам РК",
    "Шаблоны: услуги, NDA, трудовой, поставка, акт",
    "Претензии, уведомления и протоколы разногласий",
    "Обязательства, сроки и обеспечительные меры",
    "Объясняет закон без юридического жаргона",
  ],
  consultant: [
    "Business Health Check: оценка устойчивости компании",
    "SWOT и карта рисков",
    "Unit-экономика, маржа, LTV/CAC",
    "Гипотезы роста и приоритезация экспериментов",
    "Каркас бизнес-плана и анализ рынка",
    "Фокус на прибыльности, а не на «просто выручке»",
  ],
};

export const suggestedQuestions: Record<AgentSlug, string[]> = {
  accountant: [
    "Какой налоговый режим выгоднее при обороте 18 млн ₸?",
    "Когда сдавать ФНО 910 и что будет за просрочку?",
    "Посчитай налоговую нагрузку за квартал",
  ],
  lawyer: [
    "Проверь договор услуг на скрытые штрафы",
    "Какие пункты обязательны в трудовом договоре РК?",
    "Составь NDA для подрядчика",
  ],
  consultant: [
    "Собери SWOT по нашей компании",
    "Посчитай unit-экономику по этим цифрам",
    "Что даст наибольший рост в ближайшие 90 дней?",
  ],
  team: [
    "Что самое важное сделать в этом месяце?",
    "Оцените риски по налогам, договорам и экономике",
    "Соберите план на квартал от всей команды",
  ],
};

export function capabilitiesFor(slug: AgentSlug): string[] {
  if (slug === "team") return suggestedQuestions.team;
  return agentCapabilities[slug];
}

export function agentBySlug(slug: AgentSlug) {
  if (slug === "team") {
    return {
      id: "team",
      slug: "team" as const,
      name: "Айдана",
      title: "Все компетенции",
      specialty: "Налоги, право и стратегия в одном ответе",
      description: "Айдана отвечает сразу как бухгалтер, юрист и консультант.",
      color: "#F4F1EA",
    };
  }
  return AI_AGENTS.find((agent) => agent.slug === slug) ?? AI_AGENTS[0];
}

export function slugFromParam(value: string): AgentSlug {
  if (value === "lawyer" || value === "consultant" || value === "team") return value;
  return "accountant";
}
