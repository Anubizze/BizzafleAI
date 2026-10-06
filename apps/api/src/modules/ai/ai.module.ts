import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { HeygenService } from './heygen.service';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { MockProvider } from './providers/mock.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { RavatarProvider } from './providers/ravatar.provider';
import { RavatarLiveService } from './ravatar-live.service';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    HeygenService,
    RavatarLiveService,
    AIProviderFactory,
    MockProvider,
    RavatarProvider,
    OpenAIProvider,
  ],
  exports: [AIService, AIProviderFactory, HeygenService],
})
export class AIModule {}
