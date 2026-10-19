import { api } from '@/lib/api'
import type { BodyMeasurement } from '@/types/evolution.types'

export const bodyMeasurementsService = {
  getAll: (studentId: string) =>
    api.get<BodyMeasurement[]>('/body-measurements', { params: { studentId } }).then(r => r.data),

  getOne: (id: string) =>
    api.get<BodyMeasurement>(`/body-measurements/${id}`).then(r => r.data),

  create: (data: Omit<BodyMeasurement, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<BodyMeasurement>('/body-measurements', data).then(r => r.data),

  update: (id: string, data: Partial<Omit<BodyMeasurement, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>>) =>
    api.put<BodyMeasurement>(`/body-measurements/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/body-measurements/${id}`),
}
