import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLog } from './entities/audit-log.entity';
import { Type } from 'class-transformer';

export class AuditQueryDto {
  @IsOptional()
  @IsEnum(AuditAction)
  actionType?: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  adminId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(query: AuditQueryDto) {
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.admin', 'admin')
      .orderBy('a.created_at', 'DESC');

    if (query.actionType)
      qb.andWhere('a.action_type = :actionType', {
        actionType: query.actionType,
      });
    if (query.entityType)
      qb.andWhere('a.entity_type = :entityType', {
        entityType: query.entityType,
      });
    if (query.adminId)
      qb.andWhere('a.admin_id = :adminId', { adminId: query.adminId });
    if (query.dateFrom)
      qb.andWhere('a.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('a.created_at <= :dateTo', { dateTo: query.dateTo });

    const limit = Math.min(query.limit ?? 50, 200);
    const offset = query.offset ?? 0;
    qb.take(limit).skip(offset);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, limit, offset };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.auditRepo.find({
      where: { entityType, entityId },
      relations: { admin: true },
      order: { createdAt: 'DESC' },
    });
  }
}
