import client from './client'
import type { Booking, BookingHistory, BookingQuery } from '../types'

export const bookingsApi = {
  create: (data: {
    customerFullName: string
    customerPhone: string
    date: string
    startTime: string
    endTime: string
  }) => client.post<Booking>('/bookings', data).then((r) => r.data),

  findAll: (query?: BookingQuery) =>
    client.get<Booking[]>('/bookings', { params: query }).then((r) => r.data),

  findOne: (id: string) =>
    client.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  findHistory: (id: string) =>
    client.get<BookingHistory[]>(`/bookings/${id}/history`).then((r) => r.data),

  getSchedule: (date: string) =>
    client.get<Booking[]>('/bookings/schedule', { params: { date } }).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      customerFullName: string
      customerPhone: string
      date: string
      startTime: string
      endTime: string
      status: string
    }>,
  ) => client.patch<Booking>(`/bookings/${id}`, data).then((r) => r.data),

  cancel: (id: string, data: { reason: string; note?: string }) =>
    client.patch<Booking>(`/bookings/${id}/cancel`, data).then((r) => r.data),
}
