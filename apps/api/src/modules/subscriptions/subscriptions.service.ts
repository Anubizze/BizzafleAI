import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { MockPaymentProvider, priceForPlan } from './payment-provider';

@Injectable()
export class SubscriptionsService {
  private readonly payments = new MockPaymentProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async current(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }
    return this.toSubscription(subscription);
  }

  async change(userId: string, dto: ChangePlanDto, ip?: string | null) {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    const amount = priceForPlan(dto.plan);
    const charge = await this.payments.charge({
      amount,
      currency: 'KZT',
      plan: dto.plan,
    });
    if (charge.status !== 'PAID') {
      throw new BadRequestException('Оплата не прошла');
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: dto.plan,
          status: dto.plan === SubscriptionPlan.START ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
          periodEnd,
        },
      });
      await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency: 'KZT',
          status: PaymentStatus.PAID,
          provider: charge.provider,
        },
      });
      return next;
    });

    await this.audit.log({
      userId,
      action: 'SUBSCRIPTION_CHANGE',
      entity: 'Subscription',
      entityId: updated.id,
      metadata: { plan: dto.plan, amount },
      ip,
    });

    return this.toSubscription(updated);
  }

  private toSubscription(item: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    periodEnd: Date;
  }) {
    return {
      id: item.id,
      plan: item.plan,
      status: item.status,
      periodEnd: item.periodEnd.toISOString(),
    };
  }
}
