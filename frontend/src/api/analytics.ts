import client from './client'
import type {
  DateStats,
  RevenuePoint,
  YearlyRevenue,
  BusiestHour,
  BusiestDay,
  OccupancyPoint,
  AdminStat,
} from '../types'

export const analyticsApi = {
  getDateStats: (date: string) =>
    client.get<DateStats>('/analytics/date', { params: { date } }).then((r) => r.data),

  getDailyRevenue: (date: string) =>
    client.get<RevenuePoint>('/analytics/revenue/daily', { params: { date } }).then((r) => r.data),

  getWeeklyRevenue: (year: number, week: number) =>
    client.get<RevenuePoint>('/analytics/revenue/weekly', { params: { year, week } }).then((r) => r.data),

  getMonthlyRevenue: (year: number, month: number) =>
    client
      .get<RevenuePoint>('/analytics/revenue/monthly', { params: { year, month } })
      .then((r) => r.data),

  getYearlyRevenue: (year: number) =>
    client
      .get<YearlyRevenue>('/analytics/revenue/yearly', { params: { year } })
      .then((r) => r.data),

  getBusiestHours: (dateFrom?: string, dateTo?: string) =>
    client
      .get<BusiestHour[]>('/analytics/usage/busiest-hours', { params: { dateFrom, dateTo } })
      .then((r) => r.data),

  getBusiestDays: (year: number, month?: number) =>
    client
      .get<BusiestDay[]>('/analytics/usage/busiest-days', { params: { year, month } })
      .then((r) => r.data),

  getOccupancy: (dateFrom: string, dateTo: string) =>
    client
      .get<OccupancyPoint[]>('/analytics/usage/occupancy', { params: { dateFrom, dateTo } })
      .then((r) => r.data),

  getAdminStats: (dateFrom?: string, dateTo?: string) =>
    client
      .get<AdminStat[]>('/analytics/admins', { params: { dateFrom, dateTo } })
      .then((r) => r.data),
}
