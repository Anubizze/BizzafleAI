import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType, PrimaryGoal, TaxRegime } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ enum: BusinessType, example: BusinessType.TOO })
  @IsEnum(BusinessType)
  type!: BusinessType;

  @ApiProperty({ example: 'ТОО «Bizaffle Demo»' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: '230840012345' })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  binIin!: string;

  @ApiProperty({ example: 'IT / SaaS' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  industry!: string;

  @ApiProperty({ enum: TaxRegime, example: TaxRegime.SIMPLIFIED })
  @IsEnum(TaxRegime)
  taxRegime!: TaxRegime;

  @ApiPropertyOptional({ example: 8, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  employeeCount?: number;

  @ApiProperty({ enum: PrimaryGoal, example: PrimaryGoal.ALL })
  @IsEnum(PrimaryGoal)
  primaryGoal!: PrimaryGoal;
}
