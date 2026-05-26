import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';


@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a payment for a booking' })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() actor: User) {
    return this.paymentsService.create(dto, actor);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payments for a booking with summary' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a payment record and recalculate booking payment status' })
  remove(@Param('id') id: string) {
    return this.paymentsService.softDeletePayment(id);
  }
}
