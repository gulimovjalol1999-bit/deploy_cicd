import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('date')
  @ApiOperation({
    summary: 'Full stats for a specific date (bookings, revenue, hours, occupancy)',
  })
  @ApiQuery({ name: 'date', example: '2026-05-25' })
  getDateStats(@Query('date') date: string) {
    return this.analyticsService.getDateStats(date);
  }

  @Get('revenue/daily')
  @ApiOperation({ summary: 'Revenue for a specific day' })
  @ApiQuery({ name: 'date', example: '2026-05-25' })
  getDailyRevenue(@Query('date') date: string) {
    return this.analyticsService.getDailyRevenue(date);
  }

  @Get('revenue/weekly')
  @ApiOperation({ summary: 'Revenue for a specific ISO week' })
  @ApiQuery({ name: 'year', example: 2026 })
  @ApiQuery({ name: 'week', example: 21 })
  getWeeklyRevenue(@Query('year') year: string, @Query('week') week: string) {
    return this.analyticsService.getWeeklyRevenue(+year, +week);
  }

  @Get('revenue/monthly')
  @ApiOperation({ summary: 'Revenue for a specific month' })
  @ApiQuery({ name: 'year', example: 2026 })
  @ApiQuery({ name: 'month', example: 5 })
  getMonthlyRevenue(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.analyticsService.getMonthlyRevenue(+year, +month);
  }

  @Get('revenue/yearly')
  @ApiOperation({ summary: 'Full year revenue broken down by month' })
  @ApiQuery({ name: 'year', example: 2026 })
  getYearlyRevenue(@Query('year') year: string) {
    return this.analyticsService.getYearlyRevenue(+year);
  }

  @Get('usage/busiest-hours')
  @ApiOperation({ summary: 'Most popular booking start hours' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getBusiestHours(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getBusiestHours(dateFrom, dateTo);
  }

  @Get('usage/busiest-days')
  @ApiOperation({ summary: 'Top 10 busiest days in a year/month' })
  @ApiQuery({ name: 'year', example: 2026 })
  @ApiQuery({ name: 'month', required: false })
  getBusiestDays(@Query('year') year: string, @Query('month') month?: string) {
    return this.analyticsService.getBusiestDays(+year, month ? +month : undefined);
  }

  @Get('usage/occupancy')
  @ApiOperation({ summary: 'Daily occupancy rate between two dates' })
  @ApiQuery({ name: 'dateFrom', example: '2026-05-01' })
  @ApiQuery({ name: 'dateTo', example: '2026-05-31' })
  getOccupancy(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.analyticsService.getOccupancyRate(dateFrom, dateTo);
  }

  @Get('admins')
  @ApiOperation({
    summary: 'Per-admin stats: bookings created, revenue, cancellation rate',
  })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getAdminStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getAdminStats(dateFrom, dateTo);
  }
}
