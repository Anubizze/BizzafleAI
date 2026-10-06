import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AgentSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth';
import { AIService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AIController {
  constructor(private readonly ai: AIService) {}

  @Get('agents')
  @ApiOperation({ summary: 'Список AI-агентов' })
  agents() {
    return this.ai.agents();
  }

  @Post('avatar/session')
  @ApiOperation({ summary: 'Одноразовый токен HeyGen для аватара Айданы' })
  avatarSession() {
    return this.ai.avatarSession();
  }

  @Post('chat')
  @ApiOperation({ summary: 'Сообщение агенту или команде' })
  chat(@CurrentUser() user: AuthUser, @Body() dto: ChatDto) {
    return this.ai.chat(user, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Список диалогов' })
  @ApiQuery({ name: 'agent', required: false, enum: AgentSlug })
  conversations(@CurrentUser() user: AuthUser, @Query('agent') agent?: AgentSlug) {
    return this.ai.listConversations(user, agent);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Создать диалог' })
  createConversation(@CurrentUser() user: AuthUser, @Body() dto: CreateConversationDto) {
    return this.ai.createConversation(user, dto);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Диалог с сообщениями' })
  getConversation(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.ai.getConversation(user, id);
  }
}
