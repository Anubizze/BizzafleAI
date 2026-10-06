import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentCategory })
  @IsEnum(DocumentCategory)
  category!: DocumentCategory;
}
