import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentSlug } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ChatAttachmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  size!: number;

  @ApiProperty()
  @IsString()
  url!: string;
}

export class ChatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({ enum: AgentSlug })
  @IsEnum(AgentSlug)
  agentSlug!: AgentSlug;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content!: string;

  @ApiPropertyOptional({ type: [ChatAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatAttachmentDto)
  attachments?: ChatAttachmentDto[];
}
