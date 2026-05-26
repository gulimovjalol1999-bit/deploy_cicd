import client from './client'
import type { DashboardOverview } from '../types'

export const dashboardApi = {
  getOverview: () =>
    client.get<DashboardOverview>('/dashboard').then((r) => r.data),
}
