import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminService } from './admin.service';

@ApiTags('Admin Management')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin accounts (SUPER_ADMIN only)' })
  getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Admin summary with booking counts (SUPER_ADMIN only)' })
  getSummary() {
    return this.adminService.getAdminSummary();
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get admin activity: audit logs + booking stats' })
  getActivity(@Param('id') id: string) {
    return this.adminService.getAdminActivity(id);
  }
}
