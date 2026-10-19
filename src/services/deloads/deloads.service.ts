import { api } from '@/lib/api'
import type { DeloadPeriod } from '@/types/session.types'

interface CreateDeloadDto {
  studentId: string
  startDate: string
  endDate: string
  reductionPercent: number
  reason?: string
  observations?: string
}

export const deloadsService = {
  getAll: (studentId: string) =>
    api
      .get<{ data: DeloadPeriod[] }>('/deloads', { params: { studentId } })
      .then((r) => r.data.data ?? r.data),

  create: (data: CreateDeloadDto) =>
    api.post<DeloadPeriod>('/deloads', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateDeloadDto> & { status?: string }) =>
    api.put<DeloadPeriod>(`/deloads/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/deloads/${id}`),
}
