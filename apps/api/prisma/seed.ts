import {
  AgentSlug,
  BusinessType,
  CalendarEventType,
  DocumentAiStatus,
  DocumentCategory,
  MessageRole,
  NotificationType,
  PrimaryGoal,
  PrismaClient,
  RiskLevel,
  Role,
  SubscriptionPlan,
  SubscriptionStatus,
  TaxRegime,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@bizaffle.ai';
const ADMIN_EMAIL = 'admin@bizaffle.ai';
const BIN = '230840012345';

async function main(): Promise<void> {
  const [demoHash, adminHash] = await Promise.all([
    argon2.hash('Demo1234!'),
    argon2.hash('Admin1234!'),
  ]);

  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: 'Владислав',
      role: Role.USER,
      onboardingCompleted: true,
      locale: 'ru',
      phone: '+77011234567',
      passwordHash: demoHash,
    },
    create: {
      email: DEMO_EMAIL,
      name: 'Владислав',
      role: Role.USER,
      onboardingCompleted: true,
      locale: 'ru',
      phone: '+77011234567',
      passwordHash: demoHash,
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: 'Admin',
      role: Role.ADMIN,
      onboardingCompleted: true,
      passwordHash: adminHash,
    },
    create: {
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: Role.ADMIN,
      onboardingCompleted: true,
      locale: 'ru',
      passwordHash: adminHash,
    },
  });

  let company = await prisma.company.findFirst({
    where: { ownerId: demo.id, binIin: BIN },
  });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'ТОО «Bizaffle Demo»',
        type: BusinessType.TOO,
        binIin: BIN,
        industry: 'IT / SaaS',
        taxRegime: TaxRegime.SIMPLIFIED,
        employeeCount: 8,
        registeredAt: new Date('2023-03-14'),
        primaryGoal: PrimaryGoal.ALL,
        ownerId: demo.id,
      },
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: 'ТОО «Bizaffle Demo»',
        type: BusinessType.TOO,
        industry: 'IT / SaaS',
        taxRegime: TaxRegime.SIMPLIFIED,
        employeeCount: 8,
        registeredAt: new Date('2023-03-14'),
        primaryGoal: PrimaryGoal.ALL,
      },
    });
  }

  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: demo.id } },
    update: { role: Role.COMPANY_ADMIN },
    create: { companyId: company.id, userId: demo.id, role: Role.COMPANY_ADMIN },
  });

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);
  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: {
      plan: SubscriptionPlan.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      periodEnd,
    },
    create: {
      userId: demo.id,
      plan: SubscriptionPlan.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      periodEnd,
    },
  });

  const agents = [
    {
      slug: AgentSlug.accountant,
      name: 'Айдана',
      title: 'AI Бухгалтер',
      specialty: 'Налоги, отчётность, финансовый анализ',
      description: 'Помогает с налоговыми режимами, сроками, нагрузкой и бухгалтерскими вопросами.',
      color: '#7C5CFF',
    },
    {
      slug: AgentSlug.lawyer,
      name: 'Алихан',
      title: 'AI Юрист',
      specialty: 'Договоры, риски, законодательство РК',
      description: 'Разбирает договоры, указывает на риски и объясняет нормы без юридического жаргона.',
      color: '#5B8CFF',
    },
    {
      slug: AgentSlug.consultant,
      name: 'Данияр',
      title: 'AI Бизнес-консультант',
      specialty: 'Стратегия, unit-экономика, рост',
      description: 'Считает экономику, предлагает гипотезы роста и держит фокус на прибыльности.',
      color: '#C084FC',
    },
  ];

  for (const agent of agents) {
    await prisma.aIAgent.upsert({
      where: { slug: agent.slug },
      update: agent,
      create: agent,
    });
  }

  await prisma.businessMetric.deleteMany({ where: { companyId: company.id } });
  await prisma.calendarEvent.deleteMany({ where: { companyId: company.id } });
  await prisma.document.deleteMany({ where: { companyId: company.id } });
  await prisma.aIConversation.deleteMany({ where: { companyId: company.id } });
  await prisma.notification.deleteMany({ where: { userId: demo.id } });
  await prisma.businessHealthCheck.deleteMany({ where: { companyId: company.id } });

  const metrics = [
    { month: '2026-05', income: 4_820_000, expense: 3_150_000 },
    { month: '2026-06', income: 5_240_000, expense: 3_410_000 },
    { month: '2026-07', income: 4_610_000, expense: 3_280_000 },
    { month: '2026-08', income: 6_150_000, expense: 3_890_000 },
    { month: '2026-09', income: 7_240_000, expense: 4_260_000 },
    { month: '2026-10', income: 6_780_000, expense: 4_020_000 },
  ];
  await prisma.businessMetric.createMany({
    data: metrics.map((item) => ({ ...item, companyId: company.id })),
  });

  const today = new Date('2026-10-04T09:00:00.000Z');
  const events: Array<{
    title: string;
    type: CalendarEventType;
    date: Date;
    amount?: number;
    description: string;
  }> = [
    {
      title: 'Зарплата и аванс команде',
      type: CalendarEventType.PAYMENT,
      date: day(today, 1),
      amount: 2_450_000,
      description: 'ФОТ + премии за сентябрь',
    },
    {
      title: 'Сверка с ТОО «КазТех»',
      type: CalendarEventType.TASK,
      date: day(today, 4),
      description: 'Акт сверки за III квартал',
    },
    {
      title: 'Аренда офиса',
      type: CalendarEventType.PAYMENT,
      date: day(today, 6),
      amount: 680_000,
      description: 'Октябрь, БЦ на Аль-Фараби',
    },
    {
      title: 'Статистический отчёт',
      type: CalendarEventType.REPORT,
      date: day(today, 6),
      description: 'Форма 2-предпринимательство',
    },
    {
      title: 'Социальные платежи и упрощёнка',
      type: CalendarEventType.TAX,
      date: day(today, 11),
      amount: 410_000,
      description: 'СН, СО, ОСМС, ОПВ + ориентир 3%',
    },
    {
      title: 'Продление договора с клиентом',
      type: CalendarEventType.CONTRACT,
      date: day(today, 16),
      description: 'SLA и цена на 2027 год',
    },
    {
      title: 'ОПВ и СО за октябрь',
      type: CalendarEventType.TAX,
      date: day(today, 21),
      amount: 290_000,
      description: 'Не путать с налогом с оборота',
    },
    {
      title: 'Декларация 910 за III квартал',
      type: CalendarEventType.REPORT,
      date: day(today, 24),
      description: 'Проверить обороты с выпиской',
    },
  ];
  await prisma.calendarEvent.createMany({
    data: events.map((event) => ({ ...event, companyId: company.id })),
  });

  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');
  await mkdir(uploadDir, { recursive: true });

  const documentSpecs: Array<{
    file: string;
    name: string;
    category: DocumentCategory;
    aiStatus: DocumentAiStatus;
    body: string;
    analyze?: 'HIGH' | 'LOW';
  }> = [
    {
      file: 'contract-kaztech.txt',
      name: 'Договор с ТОО «КазТех».pdf',
      category: DocumentCategory.CONTRACT,
      aiStatus: DocumentAiStatus.RISKS,
      analyze: 'HIGH',
      body: 'Договор оказания услуг. Неустойка 0,5% в день. Подсудность — арбитраж вне РК.',
    },
    {
      file: 'invoice-1042.txt',
      name: 'Счёт-фактура №1042.pdf',
      category: DocumentCategory.INVOICE,
      aiStatus: DocumentAiStatus.CHECKED,
      body: 'Счёт на 1 280 000 ₸ за внедрение кабинета клиента.',
    },
    {
      file: 'act-august.txt',
      name: 'Акт выполненных работ — август.pdf',
      category: DocumentCategory.ACT,
      aiStatus: DocumentAiStatus.CHECKED,
      body: 'Акт на 980 000 ₸, подписан обеими сторонами.',
    },
    {
      file: 'tax-q3.txt',
      name: 'Налоговая декларация III квартал.pdf',
      category: DocumentCategory.TAX,
      aiStatus: DocumentAiStatus.ATTENTION,
      body: 'Форма 910, оборот 18 000 000 ₸, требует сверки с банком.',
    },
    {
      file: 'hr-manager.txt',
      name: 'Трудовой договор менеджера.pdf',
      category: DocumentCategory.HR,
      aiStatus: DocumentAiStatus.PENDING,
      body: 'Трудовой договор, оклад 450 000 ₸, испытательный срок 3 месяца.',
    },
    {
      file: 'lease-office.txt',
      name: 'Договор аренды офиса.pdf',
      category: DocumentCategory.CONTRACT,
      aiStatus: DocumentAiStatus.CHECKED,
      analyze: 'LOW',
      body: 'Аренда 680 000 ₸ / мес, депозит 1 месяц, индексация без формулы.',
    },
    {
      file: 'invoice-aws.txt',
      name: 'Инвойс AWS — сентябрь.pdf',
      category: DocumentCategory.INVOICE,
      aiStatus: DocumentAiStatus.PENDING,
      body: 'AWS 412 USD, оплата картой, нужен валютный учёт.',
    },
    {
      file: 'hr-vacation.txt',
      name: 'Приказ об отпуске.pdf',
      category: DocumentCategory.HR,
      aiStatus: DocumentAiStatus.CHECKED,
      body: 'Ежегодный отпуск 14 календарных дней, октябрь 2026.',
    },
  ];

  for (const spec of documentSpecs) {
    await writeFile(path.join(uploadDir, spec.file), spec.body, 'utf8');
    const document = await prisma.document.create({
      data: {
        name: spec.name,
        category: spec.category,
        mimeType: 'application/pdf',
        size: Buffer.byteLength(spec.body),
        storageKey: spec.file,
        aiStatus: spec.aiStatus,
        companyId: company.id,
        userId: demo.id,
      },
    });

    if (spec.analyze === 'HIGH') {
      await prisma.documentAnalysis.create({
        data: {
          documentId: document.id,
          riskLevel: RiskLevel.HIGH,
          summary:
            'Договор с ТОО «КазТех» содержит неограниченную неустойку, одностороннюю приёмку и подсудность вне РК.',
          risks: [
            {
              title: 'Неустойка без потолка',
              detail: '0,5% за каждый день просрочки.',
              clause: 'п. 7.2',
              severity: 'HIGH',
            },
            {
              title: 'Подсудность вне РК',
              detail: 'Арбитраж за пределами Казахстана.',
              clause: 'п. 10.1',
              severity: 'MEDIUM',
            },
          ],
          obligations: [
            {
              title: 'Срок 10 рабочих дней',
              detail: 'Старт от аванса, ТЗ может уточняться позже.',
              clause: 'п. 3.1',
            },
          ],
          penalties: [
            {
              title: 'Штраф за NDA',
              detail: '500 МРП за разглашение факта договора.',
              clause: 'п. 8.3',
              severity: 'MEDIUM',
            },
          ],
          deadlines: [
            {
              title: 'Приёмка 15 дней',
              detail: 'Молчание не считается акцептом.',
              clause: 'п. 5.1',
            },
          ],
          payments: [
            {
              title: 'Аванс 20% / остаток 80%',
              detail: 'Остаток — 30 банковских дней после акта, KZT.',
              clause: 'п. 6.1',
            },
          ],
          recommendations: [
            'Ограничить неустойку 10% суммы договора',
            'Вернуть подсудность в РК',
            'Права на результат — после полной оплаты',
          ],
        },
      });
    }

    if (spec.analyze === 'LOW') {
      await prisma.documentAnalysis.create({
        data: {
          documentId: document.id,
          riskLevel: RiskLevel.LOW,
          summary: 'Договор аренды офиса стандартный. Критичных ловушек нет.',
          risks: [
            {
              title: 'Индексация без формулы',
              detail: 'Ежегодный пересмотр ставки не ограничен.',
              clause: 'п. 4.3',
              severity: 'LOW',
            },
          ],
          obligations: [
            {
              title: 'Коммунальные сверх ставки',
              detail: 'Оплата по счетам КСК.',
              clause: 'п. 4.5',
            },
          ],
          penalties: [
            {
              title: 'Пеня 0,1% в день',
              detail: 'Умеренная ставка за просрочку аренды.',
              clause: 'п. 7.1',
              severity: 'LOW',
            },
          ],
          deadlines: [
            {
              title: 'Оплата до 10 числа',
              detail: 'Ежемесячно на счёт арендодателя.',
              clause: 'п. 4.1',
            },
          ],
          payments: [
            {
              title: 'Депозит 1 месяц',
              detail: 'Возврат за 10 рабочих дней после акта.',
              clause: 'п. 4.2',
            },
          ],
          recommendations: [
            'Зафиксировать потолок индексации 10%',
            'Прописать перечень удержаний из депозита',
          ],
        },
      });
    }
  }

  const accountant = await prisma.aIConversation.create({
    data: {
      title: 'Сроки налогов за сентябрь',
      agentSlug: AgentSlug.accountant,
      companyId: company.id,
      userId: demo.id,
    },
  });
  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: accountant.id,
        role: MessageRole.user,
        agentSlug: AgentSlug.accountant,
        content: 'Когда платить ИПН и соцналог за сентябрь? Мы ТОО на упрощёнке, 8 человек.',
      },
      {
        conversationId: accountant.id,
        role: MessageRole.assistant,
        agentSlug: AgentSlug.accountant,
        content: [
          '### Айдана · AI Бухгалтер',
          '',
          'Для ТОО «Bizaffle Demo» на упрощёнке разделите два контура:',
          '',
          '1. **Зарплатные платежи (до 25-го, лучше до 15-го)** — ОПВ, СО, ОСМС, СН, ИПН с зарплат.',
          '2. **Налог с оборота** — 3% по упрощённой декларации, не путать с «прибылью».',
          '',
          'Заложите ориентир: ФОТ × 32–35% плюс 3% от поступлений за сентябрь.',
          '',
          '---',
          '*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного бухгалтера.*',
        ].join('\n'),
      },
      {
        conversationId: accountant.id,
        role: MessageRole.user,
        agentSlug: AgentSlug.accountant,
        content: 'Можно ли уменьшить налог за счёт AWS и рекламы?',
      },
      {
        conversationId: accountant.id,
        role: MessageRole.assistant,
        agentSlug: AgentSlug.accountant,
        content: [
          'На упрощёнке расходы **не уменьшают** объект обложения — считается оборот.',
          'AWS и таргет имеют смысл для прибыли и кассы, но не для ставки 3%.',
          'Если нагрузка растёт, сравните переход на общеустановленный режим после расчёта ФОТ и маржи.',
          '',
          '---',
          '*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного бухгалтера.*',
        ].join('\n'),
      },
    ],
  });

  const lawyer = await prisma.aIConversation.create({
    data: {
      title: 'Риски договора с подрядчиком',
      agentSlug: AgentSlug.lawyer,
      companyId: company.id,
      userId: demo.id,
    },
  });
  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: lawyer.id,
        role: MessageRole.user,
        agentSlug: AgentSlug.lawyer,
        content: 'Проверь договор с подрядчиком: штраф 0,5% в день и приёмка только через заказчика.',
      },
      {
        conversationId: lawyer.id,
        role: MessageRole.assistant,
        agentSlug: AgentSlug.lawyer,
        content: [
          '### Алихан · AI Юрист',
          '',
          'Это **высокий риск**. 0,5% в день без потолка за 60 дней = 30% контракта.',
          'Односторонняя приёмка почти всегда проигрыш в споре «сделали / не сделали».',
          '',
          'Попросите: лимит неустойки 10%, мотивированный отказ и 5 рабочих дней на доработку, суд по месту ТОО в РК.',
          '',
          '---',
          '*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного юриста.*',
        ].join('\n'),
      },
      {
        conversationId: lawyer.id,
        role: MessageRole.user,
        agentSlug: AgentSlug.lawyer,
        content: 'А если они не согласятся менять подсудность?',
      },
      {
        conversationId: lawyer.id,
        role: MessageRole.assistant,
        agentSlug: AgentSlug.lawyer,
        content: [
          'Компромисс: арбитраж МФЦА / суд Алматы, но не иностранная площадка.',
          'Параллельно ограничьте ответственность суммой договора и уберите штраф за сам факт NDA.',
          '',
          '---',
          '*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного юриста.*',
        ].join('\n'),
      },
    ],
  });

  const team = await prisma.aIConversation.create({
    data: {
      title: 'Выход на корпоративных клиентов',
      agentSlug: AgentSlug.team,
      companyId: company.id,
      userId: demo.id,
    },
  });
  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: team.id,
        role: MessageRole.user,
        agentSlug: AgentSlug.team,
        content: 'Хотим выйти на корпоративных клиентов. Что проверить команде?',
      },
      {
        conversationId: team.id,
        role: MessageRole.assistant,
        agentSlug: AgentSlug.team,
        content: [
          '## Команда Bizaffle AI',
          '',
          '### Айдана — бухгалтер',
          'Корпорат платит 30–45 дней. Заложите резерв ФОТ на 1,5 месяца и 3% налога с оборота заранее.',
          '',
          '### Алихан — юрист',
          'Пакет: договор, NDA, акт, SLA. Уберите одностороннюю приёмку и штрафы без потолка.',
          '',
          '### Данияр — консультант',
          'Не масштабируйте отдел продаж, пока не закрыты 10 повторных сделок и LTV ≥ 3× CAC.',
          '',
          '### Сводка',
          'Сначала касса и договорный шаблон, затем исходящие продажи. Иначе выиграете тендер и проиграете в марже.',
          '',
          '---',
          '*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного специалиста.*',
        ].join('\n'),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demo.id,
        type: NotificationType.DEADLINE,
        title: 'До 15 октября — социальные платежи',
        body: 'ОПВ, СО, ОСМС и СН за сентябрь лучше закрыть заранее.',
        read: false,
      },
      {
        userId: demo.id,
        type: NotificationType.DOCUMENT_RISK,
        title: 'Высокий риск в договоре с КазТех',
        body: 'Неустойка без потолка и подсудность вне РК.',
        read: false,
      },
      {
        userId: demo.id,
        type: NotificationType.TAX,
        title: 'Ориентир налога за сентябрь',
        body: '3% от оборота ≈ 217 000 ₸ плюс взносы с ФОТ.',
        read: true,
      },
      {
        userId: demo.id,
        type: NotificationType.HEALTH,
        title: 'Здоровье бизнеса: 84',
        body: 'Хорошее состояние. Следите за кассовым циклом корпоратов.',
        read: false,
      },
      {
        userId: demo.id,
        type: NotificationType.SYSTEM,
        title: 'Демо-кабинет готов',
        body: 'Мы заполнили документы, календарь и диалоги с AI.',
        read: true,
      },
    ],
  });

  await prisma.businessHealthCheck.create({
    data: {
      companyId: company.id,
      score: 84,
      label: 'Хорошее состояние',
      strengths: [
        'Стабильный рост выручки с мая по сентябрь',
        'Закрыт онбординг и есть регулярная отчётность',
        'Команда 8 человек без кассового разрыва в последнем квартале',
      ],
      weaknesses: [
        'Корпоративные договоры с жёсткими штрафами',
        'Часть документов ещё без AI-проверки',
      ],
      risks: [
        'Отсрочка оплаты от корпоратов 30–45 дней',
        'Один контракт с неустойкой без потолка',
      ],
      recommendations: [
        'Обновить шаблон B2B-договора',
        'Держать резерв ФОТ на 1,5 месяца',
        'Повторять health-check раз в месяц',
      ],
    },
  });

  console.log('Seed completed: demo@bizaffle.ai / Demo1234!, admin@bizaffle.ai / Admin1234!');
}

function day(base: Date, offset: number): Date {
  const next = new Date(base);
  next.setUTCDate(base.getUTCDate() + offset);
  return next;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
