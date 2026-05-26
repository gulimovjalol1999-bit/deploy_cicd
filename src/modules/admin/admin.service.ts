import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async getAllAdmins() {
    const users = await this.userRepo.find({
      where: { role: Role.ADMIN },
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, refreshToken, ...u }: any) => u);
  }

  async getAdminActivity(adminId: string) {
    const [recentLogs, bookingStats] = await Promise.all([
      this.auditRepo.find({
        where: { adminId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
      this.bookingRepo
        .createQueryBuilder('b')
        .select('b.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('b.created_by_id = :adminId', { adminId })
        .groupBy('b.status')
        .getRawMany(),
    ]);

    return {
      recentActivity: recentLogs,
      bookingStats: bookingStats.map((r) => ({
        status: r.status,
        count: parseInt(r.count, 10),
      })),
    };
  }

  async getAdminSummary() {
    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect('u.username', 'username')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.is_active', 'isActive')
      .addSelect('u.created_at', 'createdAt')
      .addSelect(
        '(SELECT COUNT(*) FROM bookings b WHERE b.created_by_id = u.id AND b.deleted_at IS NULL)',
        'totalBookings',
      )
      .where('u.role = :role', { role: Role.ADMIN })
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      fullName: r.fullName,
      isActive: r.isActive,
      createdAt: r.createdAt,
      totalBookings: parseInt(r.totalBookings ?? '0', 10),
    }));
  }
}
