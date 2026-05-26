import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PricingHistory } from './entities/pricing-history.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingHistory)
    private readonly pricingRepo: Repository<PricingHistory>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getCurrentPrice() {
    const record = await this.pricingRepo
      .createQueryBuilder('p')
      .where('p.effective_from <= NOW()')
      .andWhere('(p.effective_to IS NULL OR p.effective_to > NOW())')
      .orderBy('p.effective_from', 'DESC')
      .getOne();

    return {
      hourlyPrice: record ? Number(record.hourlyPrice) : 80000,
      effectiveFrom: record?.effectiveFrom ?? null,
      id: record?.id ?? null,
    };
  }

  async getHistory() {
    return this.pricingRepo.find({
      relations: { changedBy: true },
      order: { effectiveFrom: 'DESC' },
    });
  }

  async setPrice(dto: UpdatePriceDto, actor: User, ipAddress: string) {
    const effectiveFrom = dto.effectiveFrom
      ? new Date(dto.effectiveFrom)
      : new Date();

    const current = await this.getCurrentPrice();

    // Atomic: close old price record + insert new one in a single transaction
    const saved = await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(PricingHistory)
        .set({ effectiveTo: effectiveFrom })
        .where('effective_to IS NULL')
        .andWhere('effective_from < :effectiveFrom', { effectiveFrom })
        .execute();

      const record = manager.create(PricingHistory, {
        hourlyPrice: dto.hourlyPrice,
        effectiveFrom,
        note: dto.note,
        changedById: actor.id,
      });
      return manager.save(PricingHistory, record);
    });

    await this.auditRepo.save(
      this.auditRepo.create({
        actionType: AuditAction.PRICE_CHANGE,
        entityType: 'PricingHistory',
        entityId: saved.id,
        adminId: actor.id,
        ipAddress,
        oldValue: { hourlyPrice: current.hourlyPrice },
        newValue: { hourlyPrice: dto.hourlyPrice, effectiveFrom },
      }),
    );

    return saved;
  }
}
