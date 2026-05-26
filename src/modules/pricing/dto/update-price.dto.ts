import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdatePriceDto {
  @ApiProperty({ example: 90000, description: 'New hourly price in UZS' })
  @IsNumber()
  @IsPositive()
  hourlyPrice: number;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'When this price becomes effective (defaults to now)',
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ example: 'Season price adjustment' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
