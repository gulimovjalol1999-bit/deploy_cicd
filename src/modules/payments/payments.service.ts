import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePaymentDto, actor: User) {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED)
      throw new BadRequestException('Cannot add payment to a cancelled booking');

    // Atomic: save payment + recalculate paymentStatus in one transaction
    const saved = await this.dataSource.transaction(async (manager) => {
      const payment = manager.create(Payment, {
        bookingId: dto.bookingId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        note: dto.note,
        createdById: actor.id,
      });
      const savedPayment = await manager.save(Payment, payment);

      const payments = await manager.find(Payment, {
        where: { bookingId: dto.bookingId },
      });
      const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
      const paymentStatus = this.calcStatus(totalPaid, Number(booking.totalPrice));
      await manager.update(Booking, dto.bookingId, { paymentStatus });

      return savedPayment;
    });

    return saved;
  }

  async findByBooking(bookingId: string) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const payments = await this.paymentRepo.find({
      where: { bookingId },
      relations: { createdBy: true },
      order: { createdAt: 'ASC' },
    });

    const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
    const remaining = Number(booking.totalPrice) - totalPaid;

    return {
      payments,
      totalPaid,
      totalPrice: Number(booking.totalPrice),
      remaining: Math.max(remaining, 0),
      paymentStatus: booking.paymentStatus,
    };
  }

  // Soft delete — financial records must not be hard-deleted per business rules
  async softDeletePayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const booking = await this.bookingRepo.findOne({
      where: { id: payment.bookingId },
    });

    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(Payment, paymentId);

      if (booking) {
        const remaining = await manager.find(Payment, {
          where: { bookingId: payment.bookingId },
        });
        const totalPaid = remaining.reduce((s, p) => s + Number(p.amount), 0);
        const paymentStatus = this.calcStatus(totalPaid, Number(booking.totalPrice));
        await manager.update(Booking, payment.bookingId, { paymentStatus });
      }
    });

    return { message: 'Payment removed (soft delete)' };
  }

  private calcStatus(totalPaid: number, totalPrice: number): PaymentStatus {
    if (totalPaid <= 0) return PaymentStatus.UNPAID;
    if (totalPaid >= totalPrice) return PaymentStatus.PAID;
    return PaymentStatus.PARTIAL;
  }
}
