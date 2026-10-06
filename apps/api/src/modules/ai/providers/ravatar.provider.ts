import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildSystemPrompt } from '../prompts/bizaffle.system';
import {
  AIProvider,
  ChatParams,
  DocumentAnalysisResult,
  TeamChatResult,
} from './ai-provider.interface';

@Injectable()
export class RavatarProvider implements AIProvider {
  constructor(private readonly config: ConfigService) {}

  composeMessages(params: ChatParams) {
    return [
      { role: 'system', content: buildSystemPrompt(params) },
      ...params.messages,
    ];
  }

  async chat(params: ChatParams): Promise<string> {
    this.ensureConfigured();
    void this.composeMessages(params);
    throw new ServiceUnavailableException('Провайдер Ravatar ещё не подключён');
  }

  async chatTeam(_params: ChatParams): Promise<TeamChatResult> {
    this.ensureConfigured();
    throw new ServiceUnavailableException('Провайдер Ravatar ещё не подключён');
  }

  async analyzeDocument(_params: { text: string; fileName: string }): Promise<DocumentAnalysisResult> {
    this.ensureConfigured();
    throw new ServiceUnavailableException('Провайдер Ravatar ещё не подключён');
  }

  private ensureConfigured(): void {
    if (!this.config.get<string>('RAVATAR_API_KEY')) {
      throw new ServiceUnavailableException('RAVATAR_API_KEY не задан');
    }
  }
}
