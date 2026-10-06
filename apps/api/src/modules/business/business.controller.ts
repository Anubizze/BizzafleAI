import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { BusinessService } from './business.service';
import { HealthCheckDto } from './dto/health-check.dto';

@ApiTags('business')
@ApiBearerAuth('access-token')
@Controller('business')
export class BusinessController {
  constructor(private readonly business: BusinessService) {}

  @Get('health')
  @ApiOperation({ summary: 'Последняя оценка здоровья' })
  health(@CurrentUser() user: AuthUser) {
    return this.business.health(user.id);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Финансовые метрики' })
  metrics(@CurrentUser() user: AuthUser) {
    return this.business.metrics(user.id);
  }

  @Post('health-check')
  @ApiOperation({ summary: 'Пройти health-check' })
  healthCheck(@CurrentUser() user: AuthUser, @Body() dto: HealthCheckDto) {
    return this.business.runHealthCheck(user.id, dto);
  }
}
