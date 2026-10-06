import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Владислав' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: '+77011234567' })
  @IsOptional()
  @IsString()
  @Matches(/^[+0-9\s()-]{8,20}$/, { message: 'Некорректный номер телефона' })
  phone?: string;

  @ApiPropertyOptional({ enum: ['ru', 'kk', 'en'] })
  @IsOptional()
  @IsIn(['ru', 'kk', 'en'])
  locale?: string;
}
