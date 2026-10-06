import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { REFRESH_COOKIE } from '../../common/constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { AuthUser } from '../../common/types/auth';
import { getRequestIp } from '../../common/utils/request-ip';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация и START trial на 14 дней' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto, getRequestIp(req));
    this.auth.setRefreshCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Вход' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto, getRequestIp(req));
    this.auth.setRefreshCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access-токен по refresh cookie или body' })
  async refresh(
    @CurrentUser() user: AuthUser,
    @Body() _dto: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.refresh(user);
    this.auth.setRefreshCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Выход и очистка refresh cookie' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const header = req.headers.authorization;
    const accessToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE] ??
      (req.body as { refreshToken?: string } | undefined)?.refreshToken;
    this.auth.clearRefreshCookie(res);
    return this.auth.logout(accessToken, refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Восстановление пароля (mock)' })
  forgotPassword(@Body() _dto: ForgotPasswordDto) {
    return this.auth.forgotPassword();
  }
}
