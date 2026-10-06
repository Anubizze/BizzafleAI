import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Сводка платформы' })
  stats() {
    return this.admin.stats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Все пользователи' })
  users(@Query() query: PaginationQueryDto) {
    return this.admin.users(query.page, query.limit);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Все компании' })
  companies(@Query() query: PaginationQueryDto) {
    return this.admin.companies(query.page, query.limit);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Все документы' })
  documents(@Query() query: PaginationQueryDto) {
    return this.admin.documents(query.page, query.limit);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Подписки' })
  subscriptions(@Query() query: PaginationQueryDto) {
    return this.admin.subscriptions(query.page, query.limit);
  }

  @Get('ai-requests')
  @ApiOperation({ summary: 'AI-запросы' })
  aiRequests(@Query() query: PaginationQueryDto) {
    return this.admin.aiRequests(query.page, query.limit);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Выручка по месяцам (mock + payments)' })
  revenue() {
    return this.admin.revenue();
  }

  @Get('health')
  @ApiOperation({ summary: 'Состояние БД и Redis' })
  health() {
    return this.admin.health();
  }
}
