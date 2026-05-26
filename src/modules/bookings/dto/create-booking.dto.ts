import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Bobur Toshmatov' })
  @IsString()
  @IsNotEmpty()
  customerFullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ example: '2026-05-25', description: 'YYYY-MM-DD' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00', description: 'HH:MM (24h)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:MM' })
  startTime: string;

  @ApiProperty({ example: '12:00', description: 'HH:MM (24h)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:MM' })
  endTime: string;

  @ApiPropertyOptional({
    example: 80000,
    description: 'Override hourly price. If omitted, current price is used.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  hourlyPrice?: number;

  @ApiPropertyOptional({ example: 'Prenota via telefono' })
  @IsOptional()
  @IsString()
  note?: string;
}
