import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { getRequestIp } from '../../common/utils/request-ip';
import { ChangePlanDto } from './dto/change-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Текущая подписка' })
  current(@CurrentUser() user: AuthUser) {
    return this.subscriptions.current(user.id);
  }

  @Post('change')
  @ApiOperation({ summary: 'Сменить тариф (mock-оплата)' })
  change(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePlanDto,
    @Req() req: Request,
  ) {
    return this.subscriptions.change(user.id, dto, getRequestIp(req));
  }
}
