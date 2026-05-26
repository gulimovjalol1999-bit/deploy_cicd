import client from './client'
import type { PricingHistory } from '../types'

export const pricingApi = {
  getCurrent: () =>
    client.get<PricingHistory>('/pricing/current').then((r) => r.data),

  getHistory: () =>
    client.get<PricingHistory[]>('/pricing/history').then((r) => r.data),

  update: (price: number) =>
    client.post<PricingHistory>('/pricing', { hourlyPrice: price }).then((r) => r.data),
}
