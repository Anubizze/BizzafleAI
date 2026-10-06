import { SubscriptionPlan } from '@prisma/client';
import { PLAN_PRICES_KZT } from '../../common/constants';

export interface ChargeParams {
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
}

export interface ChargeResult {
  status: 'PAID' | 'FAILED';
  provider: string;
}

export interface PaymentProvider {
  charge(params: ChargeParams): Promise<ChargeResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async charge(params: ChargeParams): Promise<ChargeResult> {
    if (params.amount < 0) {
      return { status: 'FAILED', provider: 'mock' };
    }
    return { status: 'PAID', provider: 'mock' };
  }
}

export function priceForPlan(plan: SubscriptionPlan): number {
  return PLAN_PRICES_KZT[plan];
}
