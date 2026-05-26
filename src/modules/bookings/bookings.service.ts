import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { PricingHistory } from '../pricing/entities/pricing-history.entity';
import { User } from '../users/entities/user.entity';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingHistory } from './entities/booking-history.entity';
import { Booking } from './entities/booking.entity';

// Strip loaded relation objects — save only scalar fields in history snapshots
function toSnapshot(booking: Booking): Record<string, any> {
  const {
    createdBy, updatedBy, cancelledBy, history, payments, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...scalar
  } = booking as any;
  return scalar;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingHistory)
    private readonly historyRepo: Repository<BookingHistory>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(PricingHistory)
    private readonly pricingRepo: Repository<PricingHistory>,
  ) {}

  // ─── Helper ───────────────────────────────────────────────────
  private parseMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private calcHours(start: string, end: string): number {
    const diff = this.parseMinutes(end) - this.parseMinutes(start);
    if (diff <= 0) throw new BadRequestException('endTime must be after startTime');
    return parseFloat((diff / 60).toFixed(2));
  }

  private async getCurrentPrice(): Promise<number> {
    const pricing = await this.pricingRepo
      .createQueryBuilder('p')
      .where('p.effective_from <= NOW()')
      .andWhere('(p.effective_to IS NULL OR p.effective_to > NOW())')
      .orderBy('p.effective_from', 'DESC')
      .getOne();
    return pricing ? Number(pricing.hourlyPrice) : 80000;
  }

  private async checkOverlap(
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .where('b.date = :date', { date })
      .andWhere('b.status != :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .andWhere('b.start_time < :endTime', { endTime })
      .andWhere('b.end_time > :startTime', { startTime });

    if (excludeId) qb.andWhere('b.id != :excludeId', { excludeId });

    const count = await qb.getCount();
    if (count > 0)
      throw new ConflictException(
        `Time slot ${startTime}–${endTime} on ${date} is already booked`,
      );
  }

  // ─── CRUD ─────────────────────────────────────────────────────
  async create(dto: CreateBookingDto, actor: User, ipAddress: string) {
    const totalHours = this.calcHours(dto.startTime, dto.endTime);
    await this.checkOverlap(dto.date, dto.startTime, dto.endTime);

    const hourlyPrice = dto.hourlyPrice ?? (await this.getCurrentPrice());
    const totalPrice = parseFloat((totalHours * hourlyPrice).toFixed(2));

    const booking = this.bookingRepo.create({
      customerFullName: dto.customerFullName,
      customerPhone: dto.customerPhone,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalHours,
      hourlyPrice,
      totalPrice,
      createdById: actor.id,
      updatedById: actor.id,
    });

    const saved = await this.bookingRepo.save(booking);

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.BOOKING_CREATE,
        entityType: 'Booking',
        entityId: saved.id,
        adminId: actor.id,
        ipAddress,
        newValue: { ...saved },
      }),
    );

    return saved;
  }

  async findAll(query: BookingQueryDto) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.createdBy', 'createdBy')
      .leftJoinAndSelect('b.updatedBy', 'updatedBy')
      .orderBy('b.date', 'ASC')
      .addOrderBy('b.start_time', 'ASC');

    if (query.date) qb.andWhere('b.date = :date', { date: query.date });
    if (query.dateFrom)
      qb.andWhere('b.date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('b.date <= :dateTo', { dateTo: query.dateTo });
    if (query.status) qb.andWhere('b.status = :status', { status: query.status });
    if (query.customerPhone)
      qb.andWhere('b.customer_phone ILIKE :phone', {
        phone: `%${query.customerPhone}%`,
      });

    return qb.getMany();
  }

  async findOne(id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { createdBy: true, updatedBy: true, cancelledBy: true, history: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findHistory(bookingId: string) {
    // verify booking exists first
    const exists = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!exists) throw new NotFoundException('Booking not found');
    return this.historyRepo.find({
      where: { bookingId },
      relations: { changedBy: true },
      order: { changedAt: 'DESC' },
    });
  }

  // Lightweight load — no relation joins, used for write operations
  private async findRaw(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto, actor: User, ipAddress: string) {
    // Block cancellation via this endpoint — use PATCH /bookings/:id/cancel instead
    if (dto.status === BookingStatus.CANCELLED)
      throw new BadRequestException(
        'Use PATCH /bookings/:id/cancel to cancel a booking',
      );

    const booking = await this.findRaw(id);

    if (booking.status === BookingStatus.CANCELLED)
      throw new ForbiddenException('Cannot update a cancelled booking');

    const previousState = toSnapshot(booking);

    // Recalc if time or price changes
    const newDate = dto.date ?? booking.date;
    const newStart = dto.startTime ?? booking.startTime;
    const newEnd = dto.endTime ?? booking.endTime;

    const timeChanged =
      dto.date !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined;

    if (timeChanged) {
      const newHours = this.calcHours(newStart, newEnd);
      await this.checkOverlap(newDate, newStart, newEnd, id);

      const newHourlyPrice = dto.hourlyPrice ?? Number(booking.hourlyPrice);
      const newTotalPrice = parseFloat((newHours * newHourlyPrice).toFixed(2));

      Object.assign(booking, {
        date: newDate,
        startTime: newStart,
        endTime: newEnd,
        totalHours: newHours,
        hourlyPrice: newHourlyPrice,
        totalPrice: newTotalPrice,
      });
    } else if (dto.hourlyPrice !== undefined) {
      booking.hourlyPrice = dto.hourlyPrice;
      booking.totalPrice = parseFloat(
        (Number(booking.totalHours) * dto.hourlyPrice).toFixed(2),
      );
    }

    if (dto.customerFullName) booking.customerFullName = dto.customerFullName;
    if (dto.customerPhone) booking.customerPhone = dto.customerPhone;
    if (dto.status) booking.status = dto.status;
    if (dto.paymentStatus) booking.paymentStatus = dto.paymentStatus;
    booking.updatedById = actor.id;

    const saved = await this.bookingRepo.save(booking);
    const newState = toSnapshot(saved);

    await this.historyRepo.save(
      this.historyRepo.create({
        bookingId: id,
        previousState,
        newState,
        changedById: actor.id,
        changeDescription: 'Booking updated',
      }),
    );

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.BOOKING_UPDATE,
        entityType: 'Booking',
        entityId: id,
        adminId: actor.id,
        ipAddress,
        oldValue: previousState,
        newValue: newState,
      }),
    );

    return saved;
  }

  async cancel(
    id: string,
    dto: CancelBookingDto,
    actor: User,
    ipAddress: string,
  ) {
    const booking = await this.findRaw(id);

    if (booking.status === BookingStatus.CANCELLED)
      throw new ConflictException('Booking is already cancelled');

    const previousState = toSnapshot(booking);

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = dto.reason;
    booking.cancellationNote = dto.note ?? null;
    booking.cancelledById = actor.id;
    booking.cancelledAt = new Date();
    booking.updatedById = actor.id;

    const saved = await this.bookingRepo.save(booking);
    const newState = toSnapshot(saved);

    await this.historyRepo.save(
      this.historyRepo.create({
        bookingId: id,
        previousState,
        newState,
        changedById: actor.id,
        changeDescription: `Cancelled: ${dto.reason}${dto.note ? ' — ' + dto.note : ''}`,
      }),
    );

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.BOOKING_CANCEL,
        entityType: 'Booking',
        entityId: id,
        adminId: actor.id,
        ipAddress,
        oldValue: { status: previousState.status },
        newValue: { status: BookingStatus.CANCELLED, reason: dto.reason },
      }),
    );

    return saved;
  }

  async getSchedule(date: string) {
    return this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.createdBy', 'createdBy')
      .where('b.date = :date', { date })
      .orderBy('b.start_time', 'ASC')
      .getMany();
  }
}
