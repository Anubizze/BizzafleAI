import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AgentSlug, MessageRole, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { HeygenService } from './heygen.service';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { ChatMessage, TeamChatResult } from './providers/ai-provider.interface';
import { RavatarLiveService } from './ravatar-live.service';

const FALLBACK_AGENTS = [
  {
    id: 'accountant',
    slug: AgentSlug.accountant,
    name: 'Айдана',
    title: 'AI-специалист',
    specialty: 'Бухгалтер, юрист и бизнес-консультант',
    description: 'Один ассистент по налогам, договорам и стратегии для ИП и ТОО в Казахстане.',
    color: '#7C5CFF',
  },
  {
    id: 'lawyer',
    slug: AgentSlug.lawyer,
    name: 'Алихан',
    title: 'AI Юрист',
    specialty: 'Договоры, риски, законодательство РК',
    description: 'Разбирает договоры, указывает на риски и объясняет нормы без юридического жаргона.',
    color: '#5B8CFF',
  },
  {
    id: 'consultant',
    slug: AgentSlug.consultant,
    name: 'Данияр',
    title: 'AI Бизнес-консультант',
    specialty: 'Стратегия, unit-экономика, рост',
    description: 'Считает экономику, предлагает гипотезы роста и держит фокус на прибыльности.',
    color: '#C084FC',
  },
  {
    id: 'team',
    slug: AgentSlug.team,
    name: 'Команда',
    title: 'AI Команда',
    specialty: 'Бухгалтер + Юрист + Консультант',
    description: 'Три специалиста отвечают вместе и собирают общую рекомендацию.',
    color: '#111827',
  },
];

@Injectable()
export class AIService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: AIProviderFactory,
    private readonly heygen: HeygenService,
    private readonly ravatarLive: RavatarLiveService,
  ) {}

  async avatarSession() {
    if (this.ravatarLive.configured()) {
      try {
        return await this.ravatarLive.createLiveSession();
      } catch {
        /* fall through */
      }
    }
    if (this.heygen.configured()) {
      try {
        const session = await this.heygen.createClientSession();
        return { provider: 'heygen' as const, ...session };
      } catch {
        /* fall through */
      }
    }
    return {
      provider: 'local' as const,
      name: 'Айдана',
      language: 'ru',
      previewUrl: '/brand/aidana.jpg',
    };
  }

  async agents() {
    return [FALLBACK_AGENTS[0]];
  }

  async listConversations(user: AuthUser, agent?: AgentSlug) {
    const company = await this.prisma.requireCompanyForUser(user.id);
    const items = await this.prisma.aIConversation.findMany({
      where: {
        userId: user.id,
        companyId: company.id,
        ...(agent ? { agentSlug: agent } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    return items.map((item) => this.toConversation(item));
  }

  async getConversation(user: AuthUser, id: string) {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) {
      throw new NotFoundException('Диалог не найден');
    }
    if (conversation.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Нет доступа к диалогу');
    }
    return {
      ...this.toConversation(conversation),
      messages: conversation.messages.map((message) => this.toMessage(message)),
    };
  }

  async createConversation(user: AuthUser, dto: CreateConversationDto) {
    const company = await this.prisma.requireCompanyForUser(user.id);
    const conversation = await this.prisma.aIConversation.create({
      data: {
        title: dto.title?.trim() || defaultTitle(dto.agentSlug),
        agentSlug: dto.agentSlug,
        companyId: company.id,
        userId: user.id,
      },
    });
    return this.toConversation(conversation);
  }

  async chat(user: AuthUser, dto: ChatDto) {
    const company = await this.prisma.requireCompanyForUser(user.id);
    const conversation = dto.conversationId
      ? await this.ensureConversation(user, dto.conversationId, company.id)
      : await this.prisma.aIConversation.create({
          data: {
            title: dto.content.slice(0, 80),
            agentSlug: dto.agentSlug,
            companyId: company.id,
            userId: user.id,
          },
        });

    const attachments = dto.attachments
      ? (dto.attachments as unknown as Prisma.InputJsonValue)
      : undefined;

    const userMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.user,
        content: dto.content,
        agentSlug: dto.agentSlug,
        attachments,
      },
    });

    const history = await this.prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages: ChatMessage[] = history.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const provider = this.factory.get();
    const companyContext = {
      name: company.name,
      type: company.type,
      taxRegime: company.taxRegime,
      industry: company.industry,
      employeeCount: company.employeeCount,
      primaryGoal: company.primaryGoal,
    };

    let team: TeamChatResult | undefined;
    let assistantContent: string;
    if (dto.agentSlug === AgentSlug.team) {
      team = await provider.chatTeam({
        agentSlug: 'team',
        messages,
        companyContext,
      });
      assistantContent = formatTeamMessage(team);
    } else {
      assistantContent = await provider.chat({
        agentSlug: dto.agentSlug,
        messages,
        companyContext,
      });
    }

    const assistantMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.assistant,
        content: assistantContent,
        agentSlug: dto.agentSlug,
      },
    });

    await this.prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { title: conversation.title || dto.content.slice(0, 80) },
    });

    return {
      conversationId: conversation.id,
      conversation: this.toConversation({ ...conversation, updatedAt: new Date() }),
      userMessage: this.toMessage(userMessage),
      message: this.toMessage(assistantMessage),
      team,
    };
  }

  private async ensureConversation(user: AuthUser, id: string, companyId: string) {
    const conversation = await this.prisma.aIConversation.findUnique({ where: { id } });
    if (!conversation || conversation.companyId !== companyId) {
      throw new NotFoundException('Диалог не найден');
    }
    if (conversation.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Нет доступа к диалогу');
    }
    return conversation;
  }

  private toConversation(conversation: {
    id: string;
    title: string;
    agentSlug: AgentSlug;
    companyId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: conversation.id,
      title: conversation.title,
      agentSlug: conversation.agentSlug,
      companyId: conversation.companyId,
      userId: conversation.userId,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }

  private toMessage(message: {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    agentSlug: AgentSlug | null;
    attachments: Prisma.JsonValue;
    createdAt: Date;
  }) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      agentSlug: message.agentSlug,
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
      createdAt: message.createdAt.toISOString(),
    };
  }
}

function defaultTitle(slug: AgentSlug): string {
  switch (slug) {
    case AgentSlug.accountant:
      return 'Консультация с Айданой';
    case AgentSlug.lawyer:
      return 'Консультация с Алиханом';
    case AgentSlug.consultant:
      return 'Консультация с Данияром';
    case AgentSlug.team:
      return 'Сессия с командой AI';
    default:
      return 'Новый диалог';
  }
}

function formatTeamMessage(team: TeamChatResult): string {
  return [
    '## Команда Bizaffle AI',
    '',
    '### Айдана — бухгалтер',
    team.accountant,
    '',
    '### Алихан — юрист',
    team.lawyer,
    '',
    '### Данияр — консультант',
    team.consultant,
    '',
    '### Сводка',
    team.summary,
  ].join('\n');
}
