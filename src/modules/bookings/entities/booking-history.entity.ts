import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from './booking.entity';

@Entity('booking_history')
export class BookingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'jsonb', name: 'previous_state' })
  previousState: Record<string, any>;

  @Column({ type: 'jsonb', name: 'new_state' })
  newState: Record<string, any>;

  @Column({ nullable: true, name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column({ nullable: true, name: 'change_description' })
  changeDescription: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
