import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CancellationReason } from '../../../common/enums/cancellation-reason.enum';

export class CancelBookingDto {
  @ApiProperty({ enum: CancellationReason })
  @IsEnum(CancellationReason)
  reason: CancellationReason;

  @ApiPropertyOptional({ example: "Svet tushdi, uzr so'raymiz" })
  @IsOptional()
  @IsString()
  note?: string;
}
