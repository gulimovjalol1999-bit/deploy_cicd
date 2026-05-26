import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { Role } from '../../common/enums/role.enum';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async create(dto: CreateUserDto, actor: User, ipAddress: string) {
    const exists = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (exists) throw new ConflictException('Username already taken');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      password: hash,
      role: dto.role ?? Role.ADMIN,
    });
    const saved = await this.userRepo.save(user);

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.ADMIN_CREATION,
        entityType: 'User',
        entityId: saved.id,
        adminId: actor.id,
        ipAddress,
        newValue: { username: saved.username, role: saved.role },
      }),
    );

    const { password, refreshToken, ...safe } = saved as any;
    return safe;
  }

  async findAll() {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, refreshToken, ...u }: any) => u);
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, refreshToken, ...safe } = user as any;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto, actor: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // SUPER_ADMIN cannot be deactivated by another admin
    if (
      user.role === Role.SUPER_ADMIN &&
      actor.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Cannot modify SUPER_ADMIN');
    }

    const updateData: Partial<User> = {};
    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.password) updateData.password = await bcrypt.hash(dto.password, 12);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.userRepo.update(id, updateData);
    return this.findOne(id);
  }

  async deactivate(id: string, actor: User, ipAddress: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SUPER_ADMIN)
      throw new ForbiddenException('Cannot deactivate SUPER_ADMIN');

    await this.userRepo.update(id, { isActive: false });

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.ADMIN_DEACTIVATED,
        entityType: 'User',
        entityId: id,
        adminId: actor.id,
        ipAddress,
        oldValue: { isActive: true },
        newValue: { isActive: false },
      }),
    );

    return { message: 'Admin deactivated successfully' };
  }

  async softDelete(id: string, actor: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SUPER_ADMIN)
      throw new ForbiddenException('Cannot delete SUPER_ADMIN');
    await this.userRepo.softDelete(id);
    return { message: 'User deleted (soft)' };
  }
}
