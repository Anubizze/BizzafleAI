import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthCheckDto } from './dto/health-check.dto';

const STRING_SCORES: Record<string, number> = {
  yes: 90,
  no: 40,
  good: 85,
  ok: 70,
  average: 60,
  bad: 35,
  critical: 20,
  да: 90,
  нет: 40,
  хорошо: 85,
  нормально: 70,
  плохо: 35,
};

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async health(userId: string) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const latest = await this.prisma.businessHealthCheck.findFirst({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) {
      return {
        score: 0,
        label: 'Нет данных',
        strengths: [],
        weaknesses: [],
        risks: [],
        recommendations: ['Пройдите экспресс-проверку здоровья бизнеса'],
      };
    }
    return this.toHealth(latest);
  }

  async metrics(userId: string) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const items = await this.prisma.businessMetric.findMany({
      where: { companyId: company.id },
      orderBy: { month: 'asc' },
    });
    return items.map((item) => ({
      id: item.id,
      month: item.month,
      income: item.income,
      expense: item.expense,
    }));
  }

  async runHealthCheck(userId: string, dto: HealthCheckDto) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const score = computeScore(dto.answers);
    const label = labelForScore(score);
    const narrative = buildNarrative(dto.answers, score);
    const saved = await this.prisma.businessHealthCheck.create({
      data: {
        companyId: company.id,
        score,
        label,
        strengths: narrative.strengths as unknown as Prisma.InputJsonValue,
        weaknesses: narrative.weaknesses as unknown as Prisma.InputJsonValue,
        risks: narrative.risks as unknown as Prisma.InputJsonValue,
        recommendations: narrative.recommendations as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toHealth(saved);
  }

  private toHealth(item: {
    score: number;
    label: string;
    strengths: Prisma.JsonValue;
    weaknesses: Prisma.JsonValue;
    risks: Prisma.JsonValue;
    recommendations: Prisma.JsonValue;
  }) {
    return {
      score: item.score,
      label: item.label,
      strengths: asStringArray(item.strengths),
      weaknesses: asStringArray(item.weaknesses),
      risks: asStringArray(item.risks),
      recommendations: asStringArray(item.recommendations),
    };
  }
}

function normalizeAnswer(value: number | string): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value <= 10) {
      return Math.max(0, Math.min(100, value * 10));
    }
    return Math.max(0, Math.min(100, value));
  }
  const mapped = STRING_SCORES[String(value).trim().toLowerCase()];
  return mapped ?? 60;
}

function computeScore(answers: Record<string, number | string>): number {
  const values = Object.values(answers).map(normalizeAnswer);
  if (!values.length) {
    return 50;
  }
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(avg);
}

function labelForScore(score: number): string {
  if (score >= 80) {
    return 'Хорошее состояние';
  }
  if (score >= 60) {
    return 'Удовлетворительно';
  }
  if (score >= 40) {
    return 'Требует внимания';
  }
  return 'Критично';
}

function buildNarrative(answers: Record<string, number | string>, score: number) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  for (const [key, value] of Object.entries(answers)) {
    const points = normalizeAnswer(value);
    if (points >= 75) {
      strengths.push(`Сильная сторона: ${key}`);
    } else if (points < 55) {
      weaknesses.push(`Зона роста: ${key}`);
    }
  }
  if (!strengths.length) {
    strengths.push('Команда продолжает работать и собирает факты по бизнесу');
  }
  if (!weaknesses.length && score < 90) {
    weaknesses.push('Нужен регулярный контроль кассы и налоговых сроков');
  }
  return {
    strengths,
    weaknesses,
    risks:
      score < 70
        ? ['Кассовый разрыв', 'Пропуск налоговых сроков']
        : ['Точечные договорные риски'],
    recommendations:
      score >= 80
        ? ['Зафиксировать регламент сделок', 'Раз в месяц повторять health-check']
        : ['Закрыть просроченные платежи', 'Разобрать договоры с высоким риском', 'Сверить налоги за квартал'],
  };
}

function asStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [];
}
