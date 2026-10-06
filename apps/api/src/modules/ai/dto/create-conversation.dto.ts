import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentSlug } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ enum: AgentSlug })
  @IsEnum(AgentSlug)
  agentSlug!: AgentSlug;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
