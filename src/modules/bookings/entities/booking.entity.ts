import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '../../../common/enums/booking-status.enum';
import { CancellationReason } from '../../../common/enums/cancellation-reason.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_full_name' })
  customerFullName: string;

  @Index()
  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_hours' })
  totalHours: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'hourly_price' })
  hourlyPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Index()
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true, name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true, name: 'updated_by_id' })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: true,
    name: 'cancellation_reason',
  })
  cancellationReason: CancellationReason;

  @Column({ nullable: true, name: 'cancellation_note', type: 'varchar' })
  cancellationNote: string | null;

  @Column({ nullable: true, name: 'cancelled_by_id' })
  cancelledById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;

  @OneToMany('BookingHistory', 'booking')
  history: any[];

  @OneToMany('Payment', 'booking')
  payments: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
