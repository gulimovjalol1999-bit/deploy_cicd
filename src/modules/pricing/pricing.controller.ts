import { Body, Controller, Get, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PricingService } from './pricing.service';

@ApiTags('Pricing')
@ApiBearerAuth()
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current active hourly price' })
  getCurrent() {
    return this.pricingService.getCurrentPrice();
  }

  @Get('history')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get full pricing history (SUPER_ADMIN only)' })
  getHistory() {
    return this.pricingService.getHistory();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Set new hourly price (SUPER_ADMIN only). Does NOT affect past bookings.',
  })
  setPrice(
    @Body() dto: UpdatePriceDto,
    @CurrentUser() actor: User,
    @Ip() ip: string,
  ) {
    return this.pricingService.setPrice(dto, actor, ip);
  }
}
