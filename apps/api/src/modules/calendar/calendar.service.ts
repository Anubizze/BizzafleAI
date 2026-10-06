import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, from?: string, to?: string) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const range = resolveRange(from, to);
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        companyId: company.id,
        date: { gte: range.from, lte: range.to },
      },
      orderBy: { date: 'asc' },
    });
    return events.map((event) => this.toEvent(event));
  }

  async create(userId: string, dto: CreateEventDto) {
    const company = await this.prisma.requireCompanyForUser(userId);
    const event = await this.prisma.calendarEvent.create({
      data: {
        companyId: company.id,
        title: dto.title,
        type: dto.type,
        date: new Date(dto.date),
        amount: dto.amount,
        description: dto.description,
      },
    });
    return this.toEvent(event);
  }

  private toEvent(event: {
    id: string;
    title: string;
    type: string;
    date: Date;
    amount: number | null;
    description: string | null;
  }) {
    return {
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date.toISOString(),
      amount: event.amount ?? undefined,
      description: event.description ?? undefined,
    };
  }
}

function resolveRange(from?: string, to?: string): { from: Date; to: Date } {
  if (from && to) {
    return { from: new Date(from), to: new Date(to) };
  }
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0, 23, 59, 59));
  return { from: start, to: end };
}
