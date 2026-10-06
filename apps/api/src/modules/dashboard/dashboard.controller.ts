import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Обзор для главного экрана' })
  overview(@CurrentUser() user: AuthUser) {
    return this.dashboard.overview(user.id, user.name);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Лента активности' })
  activity(@CurrentUser() user: AuthUser) {
    return this.dashboard.activity(user.id);
  }
}
