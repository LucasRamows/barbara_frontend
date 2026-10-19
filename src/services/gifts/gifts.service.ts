import { api } from '@/lib/api'
import type { Gift } from '@/types/gifts.types'

export const giftsService = {
  getAll: (studentId: string) =>
    api.get<Gift[]>('/gifts', { params: { studentId } }).then(r => r.data),

  create: (data: { studentId: string; title: string; description?: string; imageUrl?: string }) =>
    api.post<Gift>('/gifts', data).then(r => r.data),

  deliver: (id: string) =>
    api.put<Gift>(`/gifts/${id}/deliver`).then(r => r.data),

  remove: (id: string) => api.delete(`/gifts/${id}`),
}
