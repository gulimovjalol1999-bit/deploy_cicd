export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type Role = 'SUPER_ADMIN' | 'ADMIN';
export type CancellationReason = 'CUSTOMER_REQUEST' | 'NO_SHOW' | 'WEATHER' | 'OTHER';
export interface User {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Booking {
    id: string;
    customerFullName: string;
    customerPhone: string;
    date: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    hourlyPrice: number;
    totalPrice: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    cancellationReason?: CancellationReason;
    cancellationNote?: string;
    cancelledAt?: string;
    createdBy?: User;
    updatedBy?: User;
    cancelledBy?: User;
    createdAt: string;
    updatedAt: string;
}
export interface BookingHistory {
    id: string;
    action: string;
    changedBy?: User;
    changedAt: string;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
}
export interface Payment {
    id: string;
    bookingId: string;
    amount: number;
    method: string;
    note?: string;
    createdBy?: User;
    createdAt: string;
}
export interface PaymentSummary {
    payments: Payment[];
    totalPaid: number;
    remaining: number;
    paymentStatus: PaymentStatus;
}
export interface PricingHistory {
    id: string;
    price: number;
    effectiveFrom: string;
    createdBy?: User;
    createdAt: string;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
export interface DashboardOverview {
    todayBookings: number;
    todayRevenue: number;
    monthlyRevenue: number;
    currentPrice: number;
    pendingPayments: number;
}
export interface DateStats {
    date: string;
    totalBookings: number;
    totalRevenue: number;
    totalHours: number;
    occupancyRate: number;
}
export interface RevenuePoint {
    date?: string;
    week?: number;
    month?: number;
    revenue: number;
}
export interface BusiestHour {
    hour: number;
    count: number;
}
export interface BusiestDay {
    date: string;
    count: number;
}
export interface OccupancyPoint {
    date: string;
    occupancyRate: number;
}
export interface AdminStat {
    adminId: string;
    adminName: string;
    bookingsCreated: number;
    revenue: number;
    cancellationRate: number;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
export interface BookingQuery {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    customerPhone?: string;
    page?: number;
    limit?: number;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    isBooked: boolean;
    booking?: Booking;
}
