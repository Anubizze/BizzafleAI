import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  ChatParams,
  DocumentAnalysisResult,
  TeamChatResult,
} from './ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  constructor(private readonly config: ConfigService) {}

  async chat(_params: ChatParams): Promise<string> {
    this.ensureConfigured();
    throw new ServiceUnavailableException('Провайдер OpenAI ещё не подключён');
  }

  async chatTeam(_params: ChatParams): Promise<TeamChatResult> {
    this.ensureConfigured();
    throw new ServiceUnavailableException('Провайдер OpenAI ещё не подключён');
  }

  async analyzeDocument(_params: { text: string; fileName: string }): Promise<DocumentAnalysisResult> {
    this.ensureConfigured();
    throw new ServiceUnavailableException('Провайдер OpenAI ещё не подключён');
  }

  private ensureConfigured(): void {
    if (!this.config.get<string>('OPENAI_API_KEY')) {
      throw new ServiceUnavailableException('OPENAI_API_KEY не задан');
    }
  }
}
