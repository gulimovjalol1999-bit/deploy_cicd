import client from './client'
import type { PaymentSummary } from '../types'

export const paymentsApi = {
  create: (data: { bookingId: string; amount: number; paymentMethod: string; note?: string }) =>
    client.post('/payments', data).then((r) => r.data),

  findByBooking: (bookingId: string) =>
    client.get<PaymentSummary>(`/payments/booking/${bookingId}`).then((r) => r.data),

  remove: (id: string) => client.delete(`/payments/${id}`),
}
