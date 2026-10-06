import type {
  AIConversation,
  AIMessage,
  AdminStats,
  BusinessHealth,
  BusinessMetric,
  CalendarEvent,
  Company,
  DashboardOverview,
  DocumentAnalysis,
  DocumentItem,
  NotificationItem,
  Subscription,
  User,
} from "@bizaffle/types";
import type { ActivityItem } from "@/lib/api/dashboard";
import type { AdminAiRequest, RevenuePoint, SystemHealth } from "@/lib/api/admin";

const now = new Date();
const iso = (days: number, hour = 10) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const month = (offset: number) => {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const DEMO_COMPANY: Company = {
  id: "demo-company",
  name: "ТОО «Bizaffle Demo»",
  type: "TOO",
  binIin: "230840012345",
  industry: "IT / SaaS",
  taxRegime: "SIMPLIFIED",
  employeeCount: 8,
  registeredAt: "2023-03-14T00:00:00.000Z",
  primaryGoal: "ALL",
  ownerId: "demo-user",
  createdAt: "2023-03-14T00:00:00.000Z",
  updatedAt: now.toISOString(),
};

export const DEMO_USER: User = {
  id: "demo-user",
  email: "demo@bizaffle.ai",
  phone: "+77011234567",
  name: "Владислав",
  role: "USER",
  locale: "ru",
  avatarUrl: null,
  onboardingCompleted: true,
  createdAt: iso(-40),
};

export const DEMO_HEALTH: BusinessHealth = {
  score: 84,
  label: "Хорошее состояние",
  strengths: [
    "Стабильный B2B-оборот 6 месяцев подряд",
    "Упрощёнка закрывается без просрочек",
    "Команда 8 человек, нагрузка распределена",
  ],
  weaknesses: [
    "Кассовый цикл корпоратов 30–45 дней",
    "Два договора без потолка неустойки",
  ],
  risks: ["Концентрация выручки на 2 клиентах", "Риск в договоре с ТОО «КазТех»"],
  recommendations: [
    "Закрыть соцплатежи до 15-го",
    "Пересогласовать п. 7.2 договора с КазТех",
    "Держать резерв 1,5 месяца ФОТ",
  ],
};

export const DEMO_OVERVIEW: DashboardOverview = {
  greetingName: "Владислав",
  health: DEMO_HEALTH,
  taxLiability: 217400,
  upcomingDeadlines: 6,
  documentsCount: 12,
  financeBalance: 8_240_000,
  risksCount: 3,
  attention: [
    {
      id: "a1",
      title: "Через 5 дней — соцплатежи",
      detail: "ОПВ, СО, ОСМС и СН за сентябрь. Ориентир 412 000 ₸.",
      tone: "warning",
    },
    {
      id: "a2",
      title: "2 договора требуют проверки",
      detail: "КазТех и NDA с подрядчиком. Есть риск штрафа без потолка.",
      tone: "danger",
    },
    {
      id: "a3",
      title: "Потенциальный налоговый риск",
      detail: "Иностранные сервисы AWS/Cursor — проверить НДС / электронные услуги.",
      tone: "warning",
    },
    {
      id: "a4",
      title: "Business Health: 84",
      detail: "Хорошее состояние. Следите за кассовым циклом корпоратов.",
      tone: "info",
    },
  ],
};

export const DEMO_ACTIVITY: ActivityItem[] = [
  { id: "act1", title: "Айдана проверила договор с КазТех", detail: "Риск HIGH · п. 7.2 неустойка без потолка", createdAt: iso(-1, 18) },
  { id: "act2", title: "Загружен акт сверки III квартал", detail: "ТОО «КазТех» · 248 КБ", createdAt: iso(-1, 14) },
  { id: "act3", title: "Напоминание: ФНО 910", detail: "Срок 25 октября", createdAt: iso(-2, 9) },
  { id: "act4", title: "Health Check обновлён", detail: "84 / 100 · Хорошее состояние", createdAt: iso(-3, 16) },
  { id: "act5", title: "Выставлен счёт №1042", detail: "1 280 000 ₸ · оплата до 12 октября", createdAt: iso(-4, 11) },
  { id: "act6", title: "Зарплата команде", detail: "ФОТ + премии за сентябрь закрыты", createdAt: iso(-5, 12) },
];

export const DEMO_METRICS: BusinessMetric[] = [-5, -4, -3, -2, -1, 0].map((offset, i) => ({
  id: `m${i}`,
  month: month(offset),
  income: [5_400_000, 5_820_000, 6_100_000, 6_450_000, 6_780_000, 7_120_000][i],
  expense: [3_900_000, 4_050_000, 4_200_000, 4_280_000, 4_410_000, 4_560_000][i],
}));

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Соцплатежи ОПВ / СО / ОСМС", type: "TAX", date: iso(5), amount: 412000, description: "За сентябрь" },
  { id: "e2", title: "ФНО 910.00", type: "REPORT", date: iso(12), description: "Полугодие / упрощёнка" },
  { id: "e3", title: "Оплата аренды БЦ", type: "PAYMENT", date: iso(2), amount: 890000, description: "Аль-Фараби" },
  { id: "e4", title: "Счёт КазТех №1042", type: "PAYMENT", date: iso(8), amount: 1280000 },
  { id: "e5", title: "Истекает NDA с подрядчиком", type: "CONTRACT", date: iso(16) },
  { id: "e6", title: "Ревизия договоров Q4", type: "TASK", date: iso(9) },
  { id: "e7", title: "Аванс команде", type: "PAYMENT", date: iso(20), amount: 2400000 },
  { id: "e8", title: "Сверка с КазТех", type: "TASK", date: iso(3) },
  { id: "e9", title: "КПН / ориентир налога", type: "TAX", date: iso(21), amount: 217400 },
  { id: "e10", title: "Продление лицензии ПО", type: "CONTRACT", date: iso(18), amount: 186000 },
];

export const DEMO_DOCUMENTS: DocumentItem[] = [
  { id: "d1", name: "Договор услуг с ТОО «КазТех».pdf", category: "CONTRACT", mimeType: "application/pdf", size: 428000, aiStatus: "RISKS", uploadedAt: iso(-6), companyId: "demo-company" },
  { id: "d2", name: "NDA подрядчик Али.pdf", category: "CONTRACT", mimeType: "application/pdf", size: 112000, aiStatus: "ATTENTION", uploadedAt: iso(-5), companyId: "demo-company" },
  { id: "d3", name: "Трудовой договор — дизайнер.docx", category: "HR", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 86000, aiStatus: "CHECKED", uploadedAt: iso(-4), companyId: "demo-company" },
  { id: "d4", name: "Акт сверки III квартал.xlsx", category: "ACT", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 64000, aiStatus: "CHECKED", uploadedAt: iso(-3), companyId: "demo-company" },
  { id: "d5", name: "Счёт №1042 КазТех.pdf", category: "INVOICE", mimeType: "application/pdf", size: 54000, aiStatus: "PENDING", uploadedAt: iso(-2), companyId: "demo-company" },
  { id: "d6", name: "ФНО 910 черновик.pdf", category: "TAX", mimeType: "application/pdf", size: 198000, aiStatus: "ATTENTION", uploadedAt: iso(-2), companyId: "demo-company" },
  { id: "d7", name: "Договор аренды офиса.pdf", category: "CONTRACT", mimeType: "application/pdf", size: 310000, aiStatus: "CHECKED", uploadedAt: iso(-20), companyId: "demo-company" },
  { id: "d8", name: "Акт выполненных работ сентябрь.pdf", category: "ACT", mimeType: "application/pdf", size: 72000, aiStatus: "CHECKED", uploadedAt: iso(-8), companyId: "demo-company" },
  { id: "d9", name: "Платёжка соцплатежи август.pdf", category: "TAX", mimeType: "application/pdf", size: 41000, aiStatus: "CHECKED", uploadedAt: iso(-25), companyId: "demo-company" },
  { id: "d10", name: "Оферта AWS Invert.pdf", category: "OTHER", mimeType: "application/pdf", size: 220000, aiStatus: "ATTENTION", uploadedAt: iso(-1), companyId: "demo-company" },
  { id: "d11", name: "Счёт дизайн-студия.pdf", category: "INVOICE", mimeType: "application/pdf", size: 38000, aiStatus: "PENDING", uploadedAt: iso(0, 8), companyId: "demo-company" },
  { id: "d12", name: "Положение об оплате труда.docx", category: "HR", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 94000, aiStatus: "CHECKED", uploadedAt: iso(-12), companyId: "demo-company" },
];

export const DEMO_ANALYSIS: DocumentAnalysis = {
  id: "an1",
  documentId: "d1",
  riskLevel: "HIGH",
  summary:
    "Договор с ТОО «КазТех» рабочий по предмету, но п. 7.2 даёт неустойку 1% в день без потолка, а подсудность вынесена за пределы РК. Подписывать в текущей редакции не стоит.",
  risks: [
    { title: "Неустойка без потолка", detail: "1% в день от суммы договора.", clause: "п. 7.2", severity: "HIGH" },
    { title: "Подсудность вне РК", detail: "Споры в арбитраже Дубая.", clause: "п. 11.1", severity: "HIGH" },
    { title: "Одностороннее расторжение", detail: "Заказчик может выйти за 5 дней без компенсации.", clause: "п. 9.4", severity: "MEDIUM" },
  ],
  obligations: [
    { title: "Срок работ", detail: "30 календарных дней с предоплаты.", clause: "п. 3.1" },
    { title: "Акт", detail: "Закрытие только по форме заказчика.", clause: "п. 4.2" },
  ],
  penalties: [{ title: "Просрочка сдачи", detail: "1% в день, потолка нет.", clause: "п. 7.2" }],
  deadlines: [{ title: "Старт", detail: "В течение 3 дней после предоплаты 40%.", clause: "п. 5.1" }],
  payments: [
    { title: "Предоплата", detail: "40% — 1 280 000 ₸", clause: "п. 5.1" },
    { title: "Постоплата", detail: "60% в течение 15 дней после акта", clause: "п. 5.2" },
  ],
  recommendations: [
    "Ограничить неустойку 10% от суммы этапа.",
    "Вернуть подсудность в суд по месту исполнителя в Алматы.",
    "Добавить срок на приёмку акта 5 рабочих дней.",
  ],
  createdAt: iso(-1),
};

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", type: "DEADLINE", title: "Через 5 дней срок соцплатежей", body: "ОПВ, СО, ОСМС и СН за сентябрь. 412 000 ₸.", read: false, createdAt: iso(0, 8) },
  { id: "n2", type: "DOCUMENT_RISK", title: "Айдана нашла риск в договоре КазТех", body: "HIGH: неустойка без потолка, п. 7.2.", read: false, createdAt: iso(-1, 17) },
  { id: "n3", type: "TAX", title: "Налоговое обязательство приближается", body: "Ориентир упрощёнки 3% ≈ 217 400 ₸.", read: false, createdAt: iso(-1, 9) },
  { id: "n4", type: "HEALTH", title: "Business Health Score 84", body: "Хорошее состояние. Кассовый цикл корпоратов давит.", read: true, createdAt: iso(-3, 16) },
  { id: "n5", type: "SYSTEM", title: "Демо-кабинет готов к презентации", body: "Документы, календарь и диалоги заполнены.", read: true, createdAt: iso(-6, 12) },
  { id: "n6", type: "DEADLINE", title: "ФНО 910 — 25 октября", body: "Черновик уже в документах.", read: false, createdAt: iso(-2, 10) },
];

export const DEMO_CONVERSATIONS: AIConversation[] = [
  { id: "c1", title: "Нанять первого сотрудника", agentSlug: "accountant", companyId: "demo-company", userId: "demo-user", createdAt: iso(-2), updatedAt: iso(0, 9) },
  { id: "c2", title: "Проверка договора КазТех", agentSlug: "accountant", companyId: "demo-company", userId: "demo-user", createdAt: iso(-1), updatedAt: iso(-1, 18) },
  { id: "c3", title: "Какой режим при обороте 18 млн", agentSlug: "accountant", companyId: "demo-company", userId: "demo-user", createdAt: iso(-4), updatedAt: iso(-4, 15) },
  { id: "c4", title: "Unit-экономика SaaS", agentSlug: "accountant", companyId: "demo-company", userId: "demo-user", createdAt: iso(-7), updatedAt: iso(-6, 11) },
];

export const DEMO_AI_REPLY =
  "### Коротко\nПо ТОО на упрощёнке ориентир налога 3% от оборота плюс соцплатежи с ФОТ. Договор с КазТех в текущей редакции подписывать не стоит — п. 7.2 без потолка неустойки.\n\n| Что | Срок / сумма |\n| --- | --- |\n| Соцплатежи | 15-е · ~412 000 ₸ |\n| ФНО 910 | 25 октября |\n| Резерв кассы | 1,5 месяца ФОТ |\n\nЭто ориентир Bizaffle AI, не замена консультации лицензированного специалиста в РК.";

export const DEMO_MESSAGES: Record<string, AIMessage[]> = {
  c1: [
    { id: "m1", conversationId: "c1", role: "user", content: "Хочу нанять первого сотрудника. Что нужно сделать?", agentSlug: "accountant", attachments: [], createdAt: iso(-2, 10) },
    {
      id: "m2",
      conversationId: "c1",
      role: "assistant",
      content:
        "### Коротко\nОформите трудовой договор, встаньте на учёт как работодатель и заложите ~32–35% сверху к окладу на ОПВ, СО, ОСМС, СН и ИПН.\n\n| Что | Зачем |\n| --- | --- |\n| Трудовой договор | ТК РК, испытательный срок, оклад |\n| ЭСФ / кабинет | Регистрация работодателя |\n| Резерв 1,5 оклада | Касса не должна порваться 15-го |\n\nЭто ориентир Bizaffle AI, не замена консультации лицензированного специалиста в РК.",
      agentSlug: "accountant",
      attachments: [],
      createdAt: iso(-2, 10),
    },
  ],
  c2: [
    { id: "m3", conversationId: "c2", role: "user", content: "Проверь договор с ТОО «КазТех». Можно подписывать?", agentSlug: "accountant", attachments: [], createdAt: iso(-1, 17) },
    {
      id: "m4",
      conversationId: "c2",
      role: "assistant",
      content:
        "### Коротко\nНе подписывайте в текущей редакции. П. 7.2 — неустойка 1% в день без потолка, п. 11.1 — арбитраж Дубая.\n\n**Что править**\n- Потолок неустойки 10% от этапа\n- Подсудность — Алматы, суд по месту исполнителя\n- Срок приёмки акта 5 рабочих дней\n\nЭто ориентир Bizaffle AI, не замена консультации лицензированного специалиста в РК.",
      agentSlug: "accountant",
      attachments: [],
      createdAt: iso(-1, 18),
    },
  ],
  c3: [
    { id: "m5", conversationId: "c3", role: "user", content: "Оборот около 18 млн. Какой налоговый режим лучше?", agentSlug: "accountant", attachments: [], createdAt: iso(-4, 14) },
    {
      id: "m6",
      conversationId: "c3",
      role: "assistant",
      content:
        "### Коротко\nПока держите упрощёнку 3%. Порог 20 млн близко — заложите переход на общеустановленный, если рост продолжится.\n\n| Режим | Когда |\n| --- | --- |\n| Упрощёнка 3% | До порога, B2B услуги |\n| Общеустановленный | Если пробьёте лимит или появятся вычеты НДС |\n\nЭто ориентир Bizaffle AI, не замена консультации лицензированного специалиста в РК.",
      agentSlug: "accountant",
      attachments: [],
      createdAt: iso(-4, 15),
    },
  ],
  c4: [
    { id: "m7", conversationId: "c4", role: "user", content: "Посчитай unit-экономику: цена 50 000, CAC 12 000, churn 4%.", agentSlug: "accountant", attachments: [], createdAt: iso(-7, 10) },
    {
      id: "m8",
      conversationId: "c4",
      role: "assistant",
      content:
        "### Коротко\nМаржа ~64%, LTV ≈ 800 000 ₸, LTV/CAC ≈ 4.2 — модель живая. Узкое место не юнит, а кассовый цикл корпоратов.\n\nДержите резерв 1,5 месяца ФОТ и не масштабируйте outbound, пока дебиторка не сжата до 21 дня.\n\nЭто ориентир Bizaffle AI, не замена консультации лицензированного специалиста в РК.",
      agentSlug: "accountant",
      attachments: [],
      createdAt: iso(-6, 11),
    },
  ],
};

export const DEMO_SWOT = {
  s: "Стабильный B2B SaaS, recurring 6 месяцев, команда 8 человек",
  w: "Кассовый цикл корпоратов 30–45 дней, 2 крупных клиента дают 70% выручки",
  o: "Выход в Астану, партнёрский канал бухгалтерий, апселл юридического модуля",
  t: "Порог упрощёнки 20 млн, риск п. 7.2 в договоре КазТех",
};

export const DEMO_UNIT = { margin: 64, ltv: 800000, ratio: 4.2 };

export const DEMO_CONSULT_NOTES =
  "Канал: outbound в ТОО Алматы. Цель квартала — +8 клиентов и сжатие дебиторки до 21 дня. Метрика успеха: MRR +1,2 млн ₸ и Business Health не ниже 80.";

export const DEMO_SUBSCRIPTION: Subscription = {
  id: "sub1",
  plan: "BUSINESS",
  status: "ACTIVE",
  periodEnd: iso(22),
};

export const DEMO_ADMIN_STATS: AdminStats = {
  totalUsers: 186,
  activeCompanies: 94,
  aiRequests: 4210,
  mrr: 2_810_600,
};

export const DEMO_ADMIN_USERS: User[] = [
  { id: "u1", email: "demo@bizaffle.ai", phone: "+77011234567", name: "Владислав", role: "USER", locale: "ru", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-40) },
  { id: "u2", email: "admin@bizaffle.ai", phone: "+77010000000", name: "Admin", role: "ADMIN", locale: "ru", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-80) },
  { id: "u3", email: "aida@almaty.kz", phone: "+77015551212", name: "Аида Нургалиева", role: "COMPANY_ADMIN", locale: "ru", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-12) },
  { id: "u4", email: "timur@too-orbit.kz", phone: "+77017778899", name: "Тимур Орбитов", role: "USER", locale: "ru", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-8) },
  { id: "u5", email: "sara@edu-plus.kz", phone: "+77019990011", name: "Сара Садыкова", role: "USER", locale: "ru", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-20) },
  { id: "u6", email: "nurlan@astana.dev", phone: "+77016667788", name: "Нурлан Астанов", role: "COMPANY_ADMIN", locale: "kk", avatarUrl: null, onboardingCompleted: true, createdAt: iso(-15) },
];

export const DEMO_ADMIN_COMPANIES: Company[] = [
  DEMO_COMPANY,
  { ...DEMO_COMPANY, id: "c-orbit", name: "ТОО «Орбита»", binIin: "220140098765", industry: "Логистика", employeeCount: 22 },
  { ...DEMO_COMPANY, id: "c-ip", name: "ИП Садыкова", type: "IP", binIin: "880512401234", industry: "Образование", employeeCount: 3, taxRegime: "PATENT" },
  { ...DEMO_COMPANY, id: "c-ast", name: "ТОО «Astana Soft»", binIin: "210940055321", industry: "IT / SaaS", employeeCount: 14, taxRegime: "GENERAL" },
  { ...DEMO_COMPANY, id: "c-mill", name: "ТОО «Алтын Мельница»", binIin: "190340077111", industry: "Производство", employeeCount: 41 },
];

export const DEMO_ADMIN_SUBS: Subscription[] = [
  DEMO_SUBSCRIPTION,
  { id: "s2", plan: "PRO", status: "ACTIVE", periodEnd: iso(18) },
  { id: "s3", plan: "START", status: "TRIAL", periodEnd: iso(6) },
  { id: "s4", plan: "BUSINESS", status: "ACTIVE", periodEnd: iso(27) },
  { id: "s5", plan: "PRO", status: "PAST_DUE", periodEnd: iso(-2) },
];

export const DEMO_AI_REQUESTS: AdminAiRequest[] = [
  { id: "r1", userEmail: "demo@bizaffle.ai", agentSlug: "accountant", createdAt: iso(0, 9) },
  { id: "r2", userEmail: "aida@almaty.kz", agentSlug: "accountant", createdAt: iso(-1, 15) },
  { id: "r3", userEmail: "timur@too-orbit.kz", agentSlug: "accountant", createdAt: iso(-1, 11) },
  { id: "r4", userEmail: "sara@edu-plus.kz", agentSlug: "lawyer", createdAt: iso(-2, 16) },
  { id: "r5", userEmail: "nurlan@astana.dev", agentSlug: "consultant", createdAt: iso(-2, 12) },
  { id: "r6", userEmail: "demo@bizaffle.ai", agentSlug: "team", createdAt: iso(-3, 10) },
];

export const DEMO_REVENUE: RevenuePoint[] = [-5, -4, -3, -2, -1, 0].map((offset, i) => ({
  month: month(offset),
  amount: [1_640_000, 1_890_000, 2_050_000, 2_240_000, 2_510_000, 2_810_600][i],
}));

export const DEMO_HEALTH_SYS: SystemHealth = {
  api: "ok",
  db: "ok",
  redis: "degraded",
  ai: "ok",
};

export const DEMO_LEGAL_REVIEWS = [
  { name: "Договор КазТех", risk: "HIGH", date: "вчера", note: "Неустойка 1%/день, п. 7.2" },
  { name: "NDA подрядчик", risk: "MEDIUM", date: "2 дня назад", note: "Срок 1 год, нет штрафа за утечку" },
  { name: "Аренда БЦ", risk: "LOW", date: "неделя назад", note: "Индексация раз в год, ок" },
  { name: "Трудовой — дизайнер", risk: "LOW", date: "4 дня назад", note: "Испытательный 2 месяца" },
];
