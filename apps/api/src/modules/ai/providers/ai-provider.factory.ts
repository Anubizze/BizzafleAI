import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../../common/logger/logger';
import { AIProvider } from './ai-provider.interface';
import { MockProvider } from './mock.provider';
import { OpenAIProvider } from './openai.provider';
import { RavatarProvider } from './ravatar.provider';

@Injectable()
export class AIProviderFactory {
  private readonly logger = new AppLogger('AIProviderFactory');

  constructor(
    private readonly config: ConfigService,
    private readonly mock: MockProvider,
    private readonly ravatar: RavatarProvider,
    private readonly openai: OpenAIProvider,
  ) {}

  get(): AIProvider {
    const name = (this.config.get<string>('AI_PROVIDER') ?? 'mock').toLowerCase();
    if (name === 'ravatar') {
      if (!this.config.get<string>('RAVATAR_API_KEY')) {
        this.logger.warn('RAVATAR_API_KEY is missing, falling back to mock');
        return this.mock;
      }
      return this.ravatar;
    }
    if (name === 'openai') {
      if (!this.config.get<string>('OPENAI_API_KEY')) {
        this.logger.warn('OPENAI_API_KEY is missing, falling back to mock');
        return this.mock;
      }
      return this.openai;
    }
    return this.mock;
  }
}
