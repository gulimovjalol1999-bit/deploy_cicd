import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: AuditAction, name: 'action_type' })
  actionType: AuditAction;

  @Index()
  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ nullable: true, name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_value' })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_value' })
  newValue: Record<string, any>;

  @Index()
  @Column({ nullable: true, name: 'admin_id' })
  adminId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  admin: User;

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
