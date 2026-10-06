import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_COOKIE } from '../../../common/constants';
import { AuthUser, JwtPayload } from '../../../common/types/auth';
import { PrismaService } from '../../../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[REFRESH_COOKIE] ?? null,
        ExtractJwt.fromBodyField('refreshToken'),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<AuthUser> {
    const token =
      request.cookies?.[REFRESH_COOKIE] ??
      (request.body as { refreshToken?: string } | undefined)?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh-токен не найден');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Сессия недействительна');
    }
    const matches = await argon2.verify(user.refreshTokenHash, token);
    if (!matches) {
      throw new UnauthorizedException('Сессия недействительна');
    }
    return { id: user.id, email: user.email, role: user.role, name: user.name };
  }
}
