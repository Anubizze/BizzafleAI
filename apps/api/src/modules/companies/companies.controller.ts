import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('companies')
@ApiBearerAuth('access-token')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Онбординг: создать компанию' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCompanyDto) {
    return this.companies.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Компании пользователя' })
  list(@CurrentUser() user: AuthUser) {
    return this.companies.current(user.id).then((company) => (company ? [company] : []));
  }

  @Get('me')
  @ApiOperation({ summary: 'Текущая компания (alias)' })
  me(@CurrentUser() user: AuthUser) {
    return this.companies.current(user.id);
  }

  @Get('current')
  @ApiOperation({ summary: 'Текущая компания пользователя' })
  current(@CurrentUser() user: AuthUser) {
    return this.companies.current(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить компанию' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companies.update(user, id, dto);
  }
}
