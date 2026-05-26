import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditService, AuditQueryDto } from './audit.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with filters (SUPER_ADMIN only)' })
  @ApiQuery({ name: 'actionType', enum: AuditAction, required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'adminId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get audit trail for a specific entity' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }
}
