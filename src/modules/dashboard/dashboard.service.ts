import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Booking } from '../bookings/entities/booking.entity';
import { PricingHistory } from '../pricing/entities/pricing-history.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(PricingHistory)
    private readonly pricingRepo: Repository<PricingHistory>,
  ) {}

  async getOverview() {
    const today = new Date().toISOString().split('T')[0];

    const [currentPrice, todayBookings, monthStats, pendingPayments] =
      await Promise.all([
        this.pricingRepo
          .createQueryBuilder('p')
          .where('p.effective_from <= NOW()')
          .andWhere('(p.effective_to IS NULL OR p.effective_to > NOW())')
          .orderBy('p.effective_from', 'DESC')
          .getOne(),

        this.bookingRepo
          .createQueryBuilder('b')
          .select('b.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .addSelect('SUM(b.total_price)', 'revenue')
          .where('b.date = :today', { today })
          .groupBy('b.status')
          .getRawMany(),

        this.bookingRepo
          .createQueryBuilder('b')
          .select('SUM(b.total_price)', 'revenue')
          .addSelect('COUNT(*)', 'bookings')
          .where(
            "DATE_PART('year', b.date::date) = DATE_PART('year', NOW()) AND DATE_PART('month', b.date::date) = DATE_PART('month', NOW())",
          )
          .andWhere('b.status IN (:...statuses)', {
            statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          })
          .getRawOne(),

        this.bookingRepo
          .createQueryBuilder('b')
          .select('COUNT(*)', 'count')
          .addSelect('SUM(b.total_price)', 'totalOwed')
          .where('b.payment_status IN (:...statuses)', {
            statuses: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
          })
          .andWhere('b.status != :cancelled', {
            cancelled: BookingStatus.CANCELLED,
          })
          .getRawOne(),
      ]);

    return {
      currentHourlyPrice: currentPrice ? Number(currentPrice.hourlyPrice) : 80000,
      today: {
        date: today,
        bookingsByStatus: todayBookings.map((r) => ({
          status: r.status,
          count: parseInt(r.count, 10),
          revenue: parseFloat(r.revenue ?? '0'),
        })),
      },
      currentMonth: {
        revenue: parseFloat(monthStats?.revenue ?? '0'),
        bookings: parseInt(monthStats?.bookings ?? '0', 10),
      },
      pendingPayments: {
        count: parseInt(pendingPayments?.count ?? '0', 10),
        totalOwed: parseFloat(pendingPayments?.totalOwed ?? '0'),
      },
    };
  }
}
