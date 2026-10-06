import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionPlan, SubscriptionStatus, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { CookieOptions, Response } from 'express';
import { AuditService } from '../../audit/audit.service';
import { REFRESH_COOKIE, TRIAL_DAYS } from '../../common/constants';
import { AuthUser, JwtPayload } from '../../common/types/auth';
import { parseDurationToSeconds } from '../../common/utils/duration';
import { toPublicUser } from '../../common/utils/user.mapper';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto, ip?: string | null) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await argon2.hash(dto.password);
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + TRIAL_DAYS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        subscription: {
          create: {
            plan: SubscriptionPlan.START,
            status: SubscriptionStatus.TRIAL,
            periodEnd,
          },
        },
      },
    });

    const tokens = await this.issueTokens(user);
    await this.audit.log({
      userId: user.id,
      action: 'AUTH_REGISTER',
      entity: 'User',
      entityId: user.id,
      ip,
    });

    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto, ip?: string | null) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.issueTokens(user);
    await this.audit.log({
      userId: user.id,
      action: 'AUTH_LOGIN',
      entity: 'User',
      entityId: user.id,
      ip,
    });

    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(authUser: AuthUser) {
    const user = await this.prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const tokens = await this.issueTokens(user);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(accessToken?: string, refreshToken?: string): Promise<{ message: string }> {
    const userId = this.peekUserId(accessToken, this.config.getOrThrow<string>('JWT_ACCESS_SECRET'))
      ?? this.peekUserId(refreshToken, this.config.getOrThrow<string>('JWT_REFRESH_SECRET'));
    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    }
    return { message: 'Вы вышли из аккаунта' };
  }

  private peekUserId(token: string | undefined, secret: string): string | undefined {
    if (!token) {
      return undefined;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { secret });
      return payload.sub;
    } catch {
      const payload = this.jwt.decode(token) as JwtPayload | null;
      return payload?.sub;
    }
  }

  forgotPassword(): { message: string } {
    return {
      message: 'Если аккаунт существует, мы отправим инструкции на почту',
    };
  }

  setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, this.cookieOptions());
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    const secure = this.config.get<string>('COOKIE_SECURE') === 'true';
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    const maxAge = parseDurationToSeconds(this.config.get<string>('JWT_REFRESH_EXPIRES'), 30 * 86400) * 1000;
    const options: CookieOptions = {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/',
      maxAge,
    };
    if (domain && domain !== 'localhost') {
      options.domain = domain;
    }
    return options;
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = parseDurationToSeconds(this.config.get<string>('JWT_ACCESS_EXPIRES'), 900);
    const refreshExpiresIn = parseDurationToSeconds(
      this.config.get<string>('JWT_REFRESH_EXPIRES'),
      30 * 86400,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...payload, typ: 'access' },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn,
        },
      ),
      this.jwt.signAsync(
        { ...payload, typ: 'refresh' },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await argon2.hash(refreshToken) },
    });

    return { accessToken, refreshToken, expiresIn };
  }
}
