import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { PricingHistory } from '../pricing/entities/pricing-history.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, PricingHistory])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
