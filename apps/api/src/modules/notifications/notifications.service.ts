import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.toNotification(item));
  }

  async markRead(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Уведомление не найдено');
    }
    const item = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return this.toNotification(item);
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: true };
  }

  private toNotification(item: {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
  }) {
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      read: item.read,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
