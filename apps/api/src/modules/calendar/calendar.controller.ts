import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { CalendarService } from './calendar.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('calendar')
@ApiBearerAuth('access-token')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'События календаря' })
  list(@CurrentUser() user: AuthUser, @Query() query: CalendarQueryDto) {
    return this.calendar.list(user.id, query.from, query.to);
  }

  @Post()
  @ApiOperation({ summary: 'Создать событие / задачу' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.calendar.create(user.id, dto);
  }
}
