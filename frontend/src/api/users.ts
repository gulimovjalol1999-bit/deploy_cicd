import client from './client'
import type { User } from '../types'

export const usersApi = {
  create: (data: { username: string; fullName: string; password: string; role: string }) =>
    client.post<User>('/users', data).then((r) => r.data),

  findAll: () => client.get<User[]>('/users').then((r) => r.data),

  findOne: (id: string) => client.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<{ username: string; fullName: string; role: string }>) =>
    client.patch<User>(`/users/${id}`, data).then((r) => r.data),

  deactivate: (id: string) =>
    client.patch<User>(`/users/${id}/deactivate`).then((r) => r.data),

  remove: (id: string) => client.delete(`/users/${id}`),
}
