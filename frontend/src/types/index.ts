// ─── Enums ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type Role = 'super_admin' | 'admin'
export type CancellationReason = 'customer_request' | 'weather_conditions' | 'electricity_outage' | 'field_issues' | 'emergency'

// ─── Entities ───────────────────────────────────────────────────────────────

export interface User {
  id: string
  username: string
  fullName: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  customerFullName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
  totalHours: number
  hourlyPrice: number
  totalPrice: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  cancellationReason?: CancellationReason
  cancellationNote?: string
  cancelledAt?: string
  createdBy?: User
  updatedBy?: User
  cancelledBy?: User
  createdAt: string
  updatedAt: string
}

export interface BookingHistory {
  id: string
  bookingId: string
  previousState: Record<string, unknown>
  newState: Record<string, unknown>
  changedBy?: User
  changeDescription: string
  changedAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  paymentMethod: string
  note?: string
  createdBy?: User
  createdAt: string
}

export interface PaymentSummary {
  payments: Payment[]
  totalPaid: number
  totalPrice: number
  remaining: number
  paymentStatus: PaymentStatus
}

export interface PricingHistory {
  id: string
  hourlyPrice: number
  effectiveFrom: string
  changedBy?: User
  createdAt: string
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardOverview {
  currentHourlyPrice: number
  today: {
    date: string
    bookingsByStatus: { status: BookingStatus; count: number; revenue: number }[]
  }
  currentMonth: {
    revenue: number
    bookings: number
  }
  pendingPayments: {
    count: number
    totalOwed: number
  }
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface DateStats {
  date: string
  bookingsCount: number
  cancelledCount: number
  totalRevenue: number
  totalHoursUsed: number
  occupancyPercent: number
}

export interface RevenuePoint {
  date?: string
  week?: number
  month?: number
  year?: number
  revenue: number
  bookings?: number
  hours?: number
}

export interface YearlyRevenue {
  year: number
  totalRevenue: number
  months: RevenuePoint[]
}

export interface BusiestHour {
  hour: number
  bookings: number
}

export interface BusiestDay {
  date: string
  bookings: number
  revenue: number
  hours: number
}

export interface OccupancyPoint {
  date: string
  usedHours: number
  occupancyPercent: number
}

export interface AdminStat {
  adminId: string
  adminName: string
  username: string
  totalBookings: number
  revenue: number
  cancellations: number
  cancellationRate: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// ─── Booking filters ─────────────────────────────────────────────────────────

export interface BookingQuery {
  status?: BookingStatus
  paymentStatus?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  customerPhone?: string
  page?: number
  limit?: number
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export interface TimeSlot {
  startTime: string
  endTime: string
  isBooked: boolean
  booking?: Booking
}
