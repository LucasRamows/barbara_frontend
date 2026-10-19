import { api } from '@/lib/api'
import type { AdminStats } from '@/types/gifts.types'

export interface PersonalRow {
  id: string
  userId: string
  name: string
  username: string
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  studentCount: number
  createdAt: string
}

export const adminService = {
  getStats: () => api.get<AdminStats>('/admin/stats').then(r => r.data),

  getPersonals: () => api.get<PersonalRow[]>('/admin/personals').then(r => r.data),

  updatePersonalStatus: (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') =>
    api.put(`/admin/personals/${userId}/status`, { status }).then(r => r.data),
}
