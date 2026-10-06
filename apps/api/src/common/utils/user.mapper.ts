import { User } from '@prisma/client';
import { PublicUser } from '../types/auth';

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    locale: user.locale,
    avatarUrl: user.avatarUrl,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt.toISOString(),
  };
}
