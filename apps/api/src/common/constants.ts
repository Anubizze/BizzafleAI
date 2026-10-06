import { SubscriptionPlan } from '@prisma/client';

export const REFRESH_COOKIE = 'refresh_token';

export const PLAN_PRICES_KZT: Record<SubscriptionPlan, number> = {
  START: 14900,
  BUSINESS: 29900,
  PRO: 59900,
};

export const TRIAL_DAYS = 14;

export const DEFAULT_PAGE_SIZE = 20;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;
