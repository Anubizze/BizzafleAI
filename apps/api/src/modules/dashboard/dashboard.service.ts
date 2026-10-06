import { Injectable } from '@nestjs/common';
import { DocumentAiStatus, RiskLevel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessService } from '../business/business.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly business: BusinessService,
  ) {}

  async overview(userId: string, greetingName: string) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const now = new Date();
    const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [health, metrics, documentsCount, upcomingDeadlines, risksCount, unread, highAnalyses] =
      await Promise.all([
        this.business.health(userId),
        this.prisma.businessMetric.findMany({
          where: { companyId: company.id },
          orderBy: { month: 'desc' },
          take: 3,
        }),
        this.prisma.document.count({ where: { companyId: company.id } }),
        this.prisma.calendarEvent.count({
          where: { companyId: company.id, date: { gte: now, lte: soon } },
        }),
        this.prisma.document.count({
          where: { companyId: company.id, aiStatus: DocumentAiStatus.RISKS },
        }),
        this.prisma.notification.findMany({
          where: { userId, read: false },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
        this.prisma.documentAnalysis.count({
          where: { document: { companyId: company.id }, riskLevel: RiskLevel.HIGH },
        }),
      ]);

    const last = metrics[0];
    const financeBalance = metrics.reduce((sum, item) => sum + item.income - item.expense, 0);
    const taxLiability = last ? Math.round(last.income * taxRate(company.taxRegime)) : 0;

    const attention = unread.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.body,
      tone: toneFromType(item.type),
    }));

    if (risksCount > 0) {
      attention.unshift({
        id: 'risks',
        title: 'Документы с рисками',
        detail: `${risksCount} документ(ов) требуют юридической проверки`,
        tone: 'danger',
      });
    }
    if (upcomingDeadlines > 0 && attention.length < 5) {
      attention.push({
        id: 'deadlines',
        title: 'Ближайшие сроки',
        detail: `${upcomingDeadlines} событий в ближайшие 14 дней`,
        tone: 'warning',
      });
    }

    return {
      greetingName,
      health,
      taxLiability,
      upcomingDeadlines,
      documentsCount,
      financeBalance,
      risksCount: risksCount + highAnalyses,
      attention: attention.slice(0, 5),
    };
  }

  async activity(userId: string) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const [notes, docs, events] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.document.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.calendarEvent.findMany({
        where: { companyId: company.id, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 3,
      }),
    ]);

    return [
      ...notes.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.body,
        createdAt: item.createdAt.toISOString(),
      })),
      ...docs.map((item) => ({
        id: `doc-${item.id}`,
        title: `Документ: ${item.name}`,
        detail: `Статус AI: ${item.aiStatus}`,
        createdAt: item.createdAt.toISOString(),
      })),
      ...events.map((item) => ({
        id: `evt-${item.id}`,
        title: item.title,
        detail: item.description ?? item.type,
        createdAt: item.date.toISOString(),
      })),
    ]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 8);
  }
}

function taxRate(regime: string): number {
  switch (regime) {
    case 'SIMPLIFIED':
      return 0.03;
    case 'RETAIL_TAX':
      return 0.04;
    case 'PATENT':
      return 0.02;
    default:
      return 0.06;
  }
}

function toneFromType(type: string): 'warning' | 'danger' | 'info' {
  if (type === 'DOCUMENT_RISK') {
    return 'danger';
  }
  if (type === 'DEADLINE' || type === 'TAX') {
    return 'warning';
  }
  return 'info';
}
