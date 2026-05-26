import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BookingsService } from './bookings.service';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (Admin only)' })
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() actor: User,
    @Ip() ip: string,
  ) {
    return this.bookingsService.create(dto, actor, ip);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings with optional filters' })
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get day schedule (all time slots for a date)' })
  @ApiQuery({ name: 'date', example: '2026-05-25' })
  getSchedule(@Query('date') date: string) {
    return this.bookingsService.getSchedule(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking detail with history & payments' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get full change history for a booking' })
  findHistory(@Param('id') id: string) {
    return this.bookingsService.findHistory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking details (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() actor: User,
    @Ip() ip: string,
  ) {
    return this.bookingsService.update(id, dto, actor, ip);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking with reason (Admin only)' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() actor: User,
    @Ip() ip: string,
  ) {
    return this.bookingsService.cancel(id, dto, actor, ip);
  }
}
