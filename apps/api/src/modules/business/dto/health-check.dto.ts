import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class HealthCheckDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'number' }, { type: 'string' }] },
    example: { cash: 8, taxes: 7, contracts: 'good', team: 9 },
  })
  @IsObject()
  answers!: Record<string, number | string>;
}
