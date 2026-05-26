import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { Booking } from '../bookings/entities/booking.entity';

const ACTIVE_STATUSES = [BookingStatus.CONFIRMED, BookingStatus.COMPLETED];
const STADIUM_HOURS_PER_DAY = 16; // 08:00–24:00

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  // ─── Date Stats ──────────────────────────────────────────────
  async getDateStats(date: string) {
    const all = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.date = :date', { date })
      .getMany();

    const active = all.filter((b) => ACTIVE_STATUSES.includes(b.status));
    const cancelled = all.filter((b) => b.status === BookingStatus.CANCELLED);

    const totalRevenue = active.reduce((s, b) => s + Number(b.totalPrice), 0);
    const totalHours = active.reduce((s, b) => s + Number(b.totalHours), 0);
    const occupancyPercent = parseFloat(
      ((totalHours / STADIUM_HOURS_PER_DAY) * 100).toFixed(2),
    );

    return {
      date,
      bookingsCount: active.length,
      cancelledCount: cancelled.length,
      totalRevenue,
      totalHoursUsed: totalHours,
      occupancyPercent,
    };
  }

  // ─── Revenue ─────────────────────────────────────────────────
  async getDailyRevenue(date: string) {
    const result = await this.bookingRepo
      .createQueryBuilder('b')
      .select('SUM(b.total_price)', 'revenue')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('SUM(b.total_hours)', 'hours')
      .where('b.date = :date', { date })
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .getRawOne();

    return {
      date,
      revenue: parseFloat(result?.revenue ?? '0'),
      bookings: parseInt(result?.bookings ?? '0', 10),
      hours: parseFloat(result?.hours ?? '0'),
    };
  }

  async getWeeklyRevenue(year: number, week: number) {
    const result = await this.bookingRepo
      .createQueryBuilder('b')
      .select('SUM(b.total_price)', 'revenue')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('SUM(b.total_hours)', 'hours')
      .where(
        "DATE_PART('year', b.date::date) = :year AND DATE_PART('week', b.date::date) = :week",
        { year, week },
      )
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .getRawOne();

    return {
      year,
      week,
      revenue: parseFloat(result?.revenue ?? '0'),
      bookings: parseInt(result?.bookings ?? '0', 10),
      hours: parseFloat(result?.hours ?? '0'),
    };
  }

  async getMonthlyRevenue(year: number, month: number) {
    const result = await this.bookingRepo
      .createQueryBuilder('b')
      .select('SUM(b.total_price)', 'revenue')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('SUM(b.total_hours)', 'hours')
      .where(
        "DATE_PART('year', b.date::date) = :year AND DATE_PART('month', b.date::date) = :month",
        { year, month },
      )
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .getRawOne();

    return {
      year,
      month,
      revenue: parseFloat(result?.revenue ?? '0'),
      bookings: parseInt(result?.bookings ?? '0', 10),
      hours: parseFloat(result?.hours ?? '0'),
    };
  }

  async getYearlyRevenue(year: number) {
    const rows = await this.bookingRepo
      .createQueryBuilder('b')
      .select("DATE_PART('month', b.date::date)", 'month')
      .addSelect('SUM(b.total_price)', 'revenue')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('SUM(b.total_hours)', 'hours')
      .where("DATE_PART('year', b.date::date) = :year", { year })
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .groupBy("DATE_PART('month', b.date::date)")
      .orderBy('month', 'ASC')
      .getRawMany();

    const totalRevenue = rows.reduce((s, r) => s + parseFloat(r.revenue ?? '0'), 0);

    return {
      year,
      totalRevenue,
      months: rows.map((r) => ({
        month: parseInt(r.month, 10),
        revenue: parseFloat(r.revenue ?? '0'),
        bookings: parseInt(r.bookings ?? '0', 10),
        hours: parseFloat(r.hours ?? '0'),
      })),
    };
  }

  // ─── Usage ───────────────────────────────────────────────────
  async getBusiestHours(dateFrom?: string, dateTo?: string) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .select("EXTRACT(HOUR FROM b.start_time::time)", 'hour')
      .addSelect('COUNT(*)', 'bookings')
      .where('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .groupBy("EXTRACT(HOUR FROM b.start_time::time)")
      .orderBy('bookings', 'DESC');

    if (dateFrom) qb.andWhere('b.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('b.date <= :dateTo', { dateTo });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      hour: parseInt(r.hour, 10),
      bookings: parseInt(r.bookings, 10),
    }));
  }

  async getBusiestDays(year: number, month?: number) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .select('b.date', 'date')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('SUM(b.total_price)', 'revenue')
      .addSelect('SUM(b.total_hours)', 'hours')
      .where("DATE_PART('year', b.date::date) = :year", { year })
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .groupBy('b.date')
      .orderBy('bookings', 'DESC')
      .limit(10);

    if (month)
      qb.andWhere("DATE_PART('month', b.date::date) = :month", { month });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      date: r.date,
      bookings: parseInt(r.bookings, 10),
      revenue: parseFloat(r.revenue ?? '0'),
      hours: parseFloat(r.hours ?? '0'),
    }));
  }

  // ─── Admin Stats ─────────────────────────────────────────────
  async getAdminStats(dateFrom?: string, dateTo?: string) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .select('b.created_by_id', 'adminId')
      .addSelect('u.full_name', 'adminName')
      .addSelect('u.username', 'username')
      .addSelect('COUNT(*)', 'totalBookings')
      .addSelect(
        `SUM(CASE WHEN b.status IN ('${BookingStatus.CONFIRMED}','${BookingStatus.COMPLETED}') THEN b.total_price ELSE 0 END)`,
        'revenue',
      )
      .addSelect(
        `SUM(CASE WHEN b.status = '${BookingStatus.CANCELLED}' THEN 1 ELSE 0 END)`,
        'cancellations',
      )
      .leftJoin('b.createdBy', 'u')
      .groupBy('b.created_by_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.username')
      .orderBy('revenue', 'DESC');

    if (dateFrom) qb.andWhere('b.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('b.date <= :dateTo', { dateTo });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      adminId: r.adminId,
      adminName: r.adminName,
      username: r.username,
      totalBookings: parseInt(r.totalBookings, 10),
      revenue: parseFloat(r.revenue ?? '0'),
      cancellations: parseInt(r.cancellations, 10),
      cancellationRate:
        parseInt(r.totalBookings, 10) > 0
          ? parseFloat(
              ((parseInt(r.cancellations, 10) / parseInt(r.totalBookings, 10)) * 100).toFixed(2),
            )
          : 0,
    }));
  }

  async getOccupancyRate(dateFrom: string, dateTo: string) {
    const rows = await this.bookingRepo
      .createQueryBuilder('b')
      .select('b.date', 'date')
      .addSelect('SUM(b.total_hours)', 'usedHours')
      .where('b.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
      .andWhere('b.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .groupBy('b.date')
      .orderBy('b.date', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      usedHours: parseFloat(r.usedHours ?? '0'),
      occupancyPercent: parseFloat(
        ((parseFloat(r.usedHours ?? '0') / STADIUM_HOURS_PER_DAY) * 100).toFixed(2),
      ),
    }));
  }
}
