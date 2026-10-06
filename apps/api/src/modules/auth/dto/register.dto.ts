import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Владислав' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'demo@bizaffle.ai' })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+77011234567' })
  @IsOptional()
  @IsString()
  @Matches(/^[+0-9\s()-]{8,20}$/, { message: 'Некорректный номер телефона' })
  phone?: string;

  @ApiProperty({ example: 'Demo1234!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
