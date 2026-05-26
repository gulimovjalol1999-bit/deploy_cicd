import client from './client'
import type { LoginResponse, User } from '../types'

export const authApi = {
  login: (username: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { username, password }).then((r) => r.data),

  logout: () => client.post('/auth/logout'),

  getMe: () => client.get<User>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    client
      .post<{ accessToken: string }>('/auth/refresh', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((r) => r.data),
}
