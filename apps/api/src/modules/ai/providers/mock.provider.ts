import { Injectable } from '@nestjs/common';
import {
  AIProvider,
  AgentSlugName,
  ChatParams,
  DocumentAnalysisResult,
  TeamChatResult,
} from './ai-provider.interface';

const DISCLAIMER =
  '\n\n---\n*Это информационная подсказка Bizaffle AI, а не замена консультации лицензированного бухгалтера, юриста или аудитора в Республике Казахстан. Проверьте нормы на дату обращения.*';

@Injectable()
export class MockProvider implements AIProvider {
  async chat(params: ChatParams): Promise<string> {
    const question = lastUserMessage(params);
    const company = companyLine(params.companyContext);
    const body = this.answer(params.agentSlug, question, company);
    return `${body}${DISCLAIMER}`;
  }

  async chatTeam(params: ChatParams): Promise<TeamChatResult> {
    const question = lastUserMessage(params);
    const company = companyLine(params.companyContext);
    const accountant = this.answer('accountant', question, company);
    const lawyer = this.answer('lawyer', question, company);
    const consultant = this.answer('consultant', question, company);
    const summary = [
      '### Сводка команды',
      '',
      'Команда сходится в трёх точках:',
      '',
      '1. **Финансы:** сначала закрыть текущие налоговые сроки и зафиксировать кассовый разрыв.',
      '2. **Право:** проверить договоры с корпоративными клиентами на штрафы, подсудность и одностороннее расторжение.',
      '3. **Рост:** не масштабировать продажи, пока unit-экономика и регламент согласования сделок не описаны на одной странице.',
      '',
      `Контекст компании: ${company}. Вопрос: «${question}».`,
    ].join('\n');

    return {
      accountant: `${accountant}${DISCLAIMER}`,
      lawyer: `${lawyer}${DISCLAIMER}`,
      consultant: `${consultant}${DISCLAIMER}`,
      summary: `${summary}${DISCLAIMER}`,
    };
  }

  async analyzeDocument(params: { text: string; fileName: string }): Promise<DocumentAnalysisResult> {
    const name = params.fileName.toLowerCase();
    if (/(договор|contract|соглашен)/i.test(name) && !/(аренд|офис)/i.test(name)) {
      return highRiskContract(params.fileName);
    }
    if (/(налог|декларац|tax)/i.test(name)) {
      return mediumTaxDocument(params.fileName);
    }
    if (/(аренд|офис)/i.test(name)) {
      return lowLeaseContract(params.fileName);
    }
    return lowGenericDocument(params.fileName);
  }

  private answer(agent: AgentSlugName, question: string, company: string): string {
    switch (agent) {
      case 'lawyer':
        return lawyerAnswer(question, company);
      case 'consultant':
        return consultantAnswer(question, company);
      case 'team':
        return teamFallback(question, company);
      case 'accountant':
      default:
        return accountantAnswer(question, company);
    }
  }
}

function lastUserMessage(params: ChatParams): string {
  const last = [...params.messages].reverse().find((message) => message.role === 'user');
  return last?.content?.trim() || 'Общий вопрос по бизнесу';
}

function companyLine(context?: Record<string, unknown>): string {
  if (!context) {
    return 'компания не указана';
  }
  const name = String(context.name ?? 'компания');
  const type = String(context.type ?? '');
  const tax = String(context.taxRegime ?? '');
  const industry = String(context.industry ?? '');
  return [name, type, industry, tax].filter(Boolean).join(', ');
}

function accountantAnswer(question: string, company: string): string {
  return [
    '### Айдана · AI Бухгалтер',
    '',
    `Разобрала вопрос: **«${question}»** для ${company}.`,
    '',
    '#### Что важно прямо сейчас',
    '',
    '| Срок | Платёж / отчёт | Комментарий |',
    '| --- | --- | --- |',
    '| до 15 числа | СН, СО, ОСМС, ОПВ | Платите за предыдущий месяц, даже на упрощёнке |',
    '| до 25 числа | Аванс / КПН или упрощёнка | Для ТОО на упрощёнке — 3% с оборота, если нет спецрежима |',
    '| ежеквартально | Декларация ф. 910 / 100 | Не путайте кассовый метод и отгрузки |',
    '',
    '#### Как я бы посчитала нагрузку',
    '',
    '1. Возьмите **оборот за месяц** (оплаты от клиентов, не выставленные счета).',
    '2. Умножьте на **3%** — ориентир налога при упрощённой декларации для ТОО.',
    '3. Отдельно заложите **ФОТ × ~32–35%** (ОПВ, СО, ОСМС, СН, ИПН) — это чаще всего больше «самого налога».',
    '4. Если есть валютные платежи (AWS, реклама) — проверьте, не возникает ли **КНП / учёт валютной переоценки**.',
    '',
    '#### Практический совет',
    '',
    '- Держите в календаре **два контура**: налоги и зарплатные взносы. Их часто путают.',
    '- Расходы уменьшают налог только на общеустановленном режиме. На упрощёнке «списать AWS» обычно нельзя.',
    '- Перед корпоративным контрактом попросите акт сверки и резерв 10–15% оборота на налоги.',
    '',
    'Если пришлёте оборот за последние 3 месяца и ФОТ, посчитаю ориентир платежа в тенге.',
  ].join('\n');
}

function lawyerAnswer(question: string, company: string): string {
  return [
    '### Алихан · AI Юрист',
    '',
    `Смотрю на вопрос **«${question}»** через призму ${company} и практики РК.`,
    '',
    '#### Красные флаги в договорах',
    '',
    '- **Штраф > 0,5% в день** или неустойка без потолка — почти всегда невыгодно исполнителю.',
    '- **Подсудность в другом городе / стране** при работе в Алматы или Астане.',
    '- **Одностороннее расторжение** заказчиком без компенсации уже сделанной работы.',
    '- **Переход исключительных прав** на все материалы «по факту оплаты аванса», а не акта.',
    '- **NDA + штраф** без определения конфиденциальной информации.',
    '',
    '#### Что проверить до подписания',
    '',
    '1. Предмет и результат — измеримые, иначе спор «сделали / не сделали».',
    '2. Сроки приёмки: 3–5 рабочих дней, молчание = акцепт.',
    '3. Порядок оплаты: аванс / постоплата / привязка к акту.',
    '4. Ответственность сторон — взаимная, с лимитом (например, сумма договора).',
    '5. Реквизиты, БИН, подпись первого руководителя или доверенность.',
    '',
    '#### Нормативная рамка (ориентир)',
    '',
    'Гражданский кодекс РК, Закон «О бухгалтерском учёте», налоговое законодательство и, если есть персональные данные сотрудников/клиентов, — Закон РК о персональных данных.',
    '',
    'Могу разобрать конкретный договор по пунктам, если загрузите файл в «Документы».',
  ].join('\n');
}

function consultantAnswer(question: string, company: string): string {
  return [
    '### Данияр · AI Бизнес-консультант',
    '',
    `Вопрос **«${question}»** для ${company} раскладываю на экономику и следующие 30 дней.`,
    '',
    '#### Быстрая рамка',
    '',
    '- **Unit-экономика:** LTV должен быть ≥ 3× CAC, иначе корпоративные продажи съедят маржу.',
    '- **Кассовый цикл:** если корпорат платит 30–45 дней, нужен резерв ФОТ на 1,5 месяца.',
    '- **Фокус:** 1 канал привлечения + 1 оффер, пока не закрыты 10 повторных сделок.',
    '',
    '#### 14-дневный план',
    '',
    '1. Посчитать валовую маржу по последним 10 счетам (не по выручке «в среднем»).',
    '2. Выписать 5 причин оттока / срыва сделки — это дешевле новой рекламы.',
    '3. Собрать пакет для корпората: договор, КП, кейс, срок внедрения, SLA.',
    '4. Назначить владельца воронки: кто отвечает за follow-up на 3-й и 7-й день.',
    '5. Раз в неделю смотреть три цифры: выручка, валовая прибыль, деньги на счёте.',
    '',
    '#### Гипотеза роста',
    '',
    'Для IT / SaaS в Казахстане чаще срабатывает **исходящие продажи + партнёр-интегратор**, а не только таргет. Проверьте, готовы ли вы закрыть 3 онбординга одновременно — иначе отдел продаж обгонит продукт.',
    '',
    'Пришлите средний чек, цикл сделки и ФОТ — посчитаю, стоит ли нанимать следующего человека.',
  ].join('\n');
}

function teamFallback(question: string, company: string): string {
  return [
    '### Команда Bizaffle AI',
    '',
    accountantAnswer(question, company),
    '',
    lawyerAnswer(question, company),
    '',
    consultantAnswer(question, company),
  ].join('\n');
}

function highRiskContract(fileName: string): DocumentAnalysisResult {
  return {
    riskLevel: 'HIGH',
    summary: `Договор «${fileName}» содержит несколько условий, которые для ТОО на упрощёнке выглядят невыгодно: неограниченная неустойка, односторонняя приёмка и переход прав до полной оплаты.`,
    risks: [
      {
        title: 'Неустойка без потолка',
        detail: '0,5% от суммы договора за каждый день просрочки без верхнего предела. За 60 дней это 30% контракта.',
        clause: 'п. 7.2',
        severity: 'HIGH',
      },
      {
        title: 'Односторонняя приёмка',
        detail: 'Заказчик может отклонить результат без мотивированного отказа и без срока на устранение.',
        clause: 'п. 5.4',
        severity: 'HIGH',
      },
      {
        title: 'Подсудность вне РК',
        detail: 'Споры отнесены к арбитражу за пределами Казахстана — дороже и дольше для SME.',
        clause: 'п. 10.1',
        severity: 'MEDIUM',
      },
    ],
    obligations: [
      {
        title: 'Срок работ 10 рабочих дней',
        detail: 'Старт отсчитывается с аванса, но ТЗ может быть уточнено позже — риск срыва срока.',
        clause: 'п. 3.1',
      },
      {
        title: 'Ежедневная отчётность',
        detail: 'Требуются статус-отчёты без формата и канала сдачи.',
        clause: 'п. 4.2',
      },
    ],
    penalties: [
      {
        title: 'Штраф за разглашение',
        detail: '500 МРП за любое разглашение, включая факт заключения договора.',
        clause: 'п. 8.3',
        severity: 'MEDIUM',
      },
    ],
    deadlines: [
      {
        title: 'Приёмка',
        detail: '15 календарных дней после передачи акта. Молчание не считается акцептом.',
        clause: 'п. 5.1',
      },
    ],
    payments: [
      {
        title: 'Аванс 20%',
        detail: 'Остаток 80% — в течение 30 банковских дней после подписания акта. Валюта — KZT.',
        clause: 'п. 6.1',
      },
    ],
    recommendations: [
      'Ограничить неустойку 10% суммы договора.',
      'Прописать мотивированный отказ и 5 рабочих дней на доработку.',
      'Сменить подсудность на суд по месту нахождения исполнителя в РК.',
      'Права на результат — после полной оплаты, не после аванса.',
    ],
  };
}

function lowLeaseContract(fileName: string): DocumentAnalysisResult {
  return {
    riskLevel: 'LOW',
    summary: `Документ «${fileName}» в целом стандартный. Критичных ловушек нет, есть несколько уточнений по индексации и депозиту.`,
    risks: [
      {
        title: 'Индексация аренды',
        detail: 'Ежегодный пересмотр без формулы. Лучше зафиксировать ИПЦ или потолок 10%.',
        clause: 'п. 4.3',
        severity: 'LOW',
      },
    ],
    obligations: [
      {
        title: 'Коммунальные платежи',
        detail: 'Арендатор оплачивает сверх ставки по счетам КСК / поставщиков.',
        clause: 'п. 4.5',
      },
    ],
    penalties: [
      {
        title: 'Пеня за просрочку аренды',
        detail: '0,1% в день, потолок не указан, но ставка умеренная.',
        clause: 'п. 7.1',
        severity: 'LOW',
      },
    ],
    deadlines: [
      {
        title: 'Оплата до 10 числа',
        detail: 'Ежемесячно, на расчётный счёт арендодателя в KZT.',
        clause: 'п. 4.1',
      },
    ],
    payments: [
      {
        title: 'Депозит 1 месяц',
        detail: 'Возврат в течение 10 рабочих дней после акта передачи помещения.',
        clause: 'п. 4.2',
      },
    ],
    recommendations: [
      'Добавить формулу индексации или потолок роста ставки.',
      'Зафиксировать срок возврата депозита и перечень удержаний.',
    ],
  };
}

function mediumTaxDocument(fileName: string): DocumentAnalysisResult {
  return {
    riskLevel: 'MEDIUM',
    summary: `В «${fileName}» есть расхождения, которые стоит сверить до подачи: оборот и расходы могут не совпасть с банковской выпиской.`,
    risks: [
      {
        title: 'Расхождение оборота',
        detail: 'Сумма реализации может отличаться от поступлений на счёт — риск камерального запроса.',
        severity: 'MEDIUM',
      },
    ],
    obligations: [
      {
        title: 'Срок подачи',
        detail: 'Декларацию нужно отправить до установленной даты налогового периода.',
      },
    ],
    penalties: [
      {
        title: 'Пеня за просрочку',
        detail: 'При опоздании начисляется пеня по НК РК плюс административный штраф.',
        severity: 'MEDIUM',
      },
    ],
    deadlines: [
      {
        title: 'Отчётный период',
        detail: 'Сверьте календарь ФНО и платёжное поручение до 25 числа.',
      },
    ],
    payments: [
      {
        title: 'Ориентир налога',
        detail: 'Для упрощёнки — процент от оборота, не от прибыли. Проверьте КБК.',
      },
    ],
    recommendations: [
      'Сверить обороты с выпиской и актами.',
      'Проверить КБК и налоговый период в платёжке.',
      'Сохранить квитанцию СОНО / кабинета налогоплательщика.',
    ],
  };
}

function lowGenericDocument(fileName: string): DocumentAnalysisResult {
  return {
    riskLevel: 'LOW',
    summary: `Файл «${fileName}» выглядит рабочим. Явных юридических или налоговых ловушек в доступном тексте нет.`,
    risks: [],
    obligations: [
      {
        title: 'Хранение',
        detail: 'Первичные документы в РК хранят не менее 5 лет — оставьте скан в Bizaffle.',
      },
    ],
    penalties: [],
    deadlines: [],
    payments: [],
    recommendations: [
      'Проверьте реквизиты, сумму, дату и подписи.',
      'Привяжите документ к сделке и контрагенту.',
    ],
  };
}
