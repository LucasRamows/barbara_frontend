import { api } from '@/lib/api'
import type { ProgressPhoto, PhotoPosition } from '@/types/evolution.types'

export const progressPhotosService = {
  getAll: (studentId: string, position?: PhotoPosition) =>
    api.get<ProgressPhoto[]>('/progress-photos', { params: { studentId, position } }).then(r => r.data),

  upload: (file: File, data: { studentId: string; date: string; position: PhotoPosition; notes?: string }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('studentId', data.studentId)
    form.append('date', data.date)
    form.append('position', data.position)
    if (data.notes) form.append('notes', data.notes)
    return api.post<ProgressPhoto>('/progress-photos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  remove: (id: string) =>
    api.delete(`/progress-photos/${id}`),
}
