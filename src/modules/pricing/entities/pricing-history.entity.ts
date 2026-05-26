import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pricing_history')
export class PricingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'hourly_price' })
  hourlyPrice: number;

  @Index()
  @Column({ type: 'timestamp', name: 'effective_from' })
  effectiveFrom: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'effective_to' })
  effectiveTo: Date;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true, name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  changedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
