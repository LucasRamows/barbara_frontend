import { api } from '@/lib/api'
import type { AdminStats } from '@/types/gifts.types'

export interface PersonalProfile {
  id: string
  name: string
  email: string | null
  phone: string | null
  bio: string | null
  avatarUrl: string | null
}

export interface PersonalRow {
  id: string           // userId
  username: string
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  createdAt: string
  personalProfile: PersonalProfile | null
}

export interface CreatePersonalData {
  username: string
  password: string
  name: string
  email?: string
  phone?: string
}

export interface UpdatePersonalData {
  name?: string
  email?: string
  phone?: string
  bio?: string
}

export const adminService = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats').then(r => r.data),

  getPersonals: () =>
    api.get<PersonalRow[]>('/personals').then(r => r.data),

  getPersonal: (id: string) =>
    api.get<PersonalRow>(`/personals/${id}`).then(r => r.data),

  createPersonal: (data: CreatePersonalData) =>
    api.post<PersonalRow>('/personals', data).then(r => r.data),

  updatePersonal: (id: string, data: UpdatePersonalData) =>
    api.put<PersonalRow>(`/personals/${id}`, data).then(r => r.data),

  removePersonal: (id: string) =>
    api.delete(`/personals/${id}`),

  updatePersonalStatus: (id: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') =>
    api.put(`/personals/${id}/status`, { status }).then(r => r.data),

  resetPersonalPassword: (id: string, newPassword: string) =>
    api.put(`/personals/${id}/reset-password`, { newPassword }),
}
