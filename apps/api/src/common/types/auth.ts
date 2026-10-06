import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  typ?: 'access' | 'refresh';
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}

export interface PublicUser {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: Role;
  locale: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
}
