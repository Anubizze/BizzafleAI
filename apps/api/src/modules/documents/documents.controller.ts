import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { getRequestIp } from '../../common/utils/request-ip';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('documents')
@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'category'],
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Загрузить документ' })
  create(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documents.create(user, file, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список документов' })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('category') category?: string,
  ) {
    return this.documents.list(user, query.page, query.limit, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Документ' })
  get(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.get(user, id);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'AI-разбор документа' })
  analyze(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.documents.analyze(user, id, getRequestIp(req));
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Последний AI-анализ' })
  analysis(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.getAnalysis(user, id);
  }
}
