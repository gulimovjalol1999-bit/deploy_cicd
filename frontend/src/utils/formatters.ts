import { format, parseISO } from 'date-fns'
import type { BookingStatus, PaymentStatus } from '../types'

export function formatDate(date: string) {
  return format(parseISO(date), 'dd.MM.yyyy')
}

export function formatDateTime(date: string) {
  return format(parseISO(date), 'dd.MM.yyyy HH:mm')
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m'
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  completed: 'Tugallangan',
  cancelled: 'Bekor qilingan',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "To'lanmagan",
  partial: "Qisman to'langan",
  paid: "To'langan",
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
}

export const CANCELLATION_REASON_LABELS: Record<string, string> = {
  customer_request: 'Mijoz talabi',
  electricity_outage: 'Svet yo\'q',
  weather_conditions: 'Ob-havo',
  field_issues: 'Maydon muammosi',
  emergency: 'Favqulodda holat',
}
