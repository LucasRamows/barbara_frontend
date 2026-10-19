import { api } from '@/lib/api'
import type { LoadSuggestion } from '@/types/session.types'

export const loadProgressionService = {
  getSuggestions: (params?: { studentId?: string }) =>
    api
      .get<{ data: LoadSuggestion[]; total: number }>('/load-progression/suggestions', { params })
      .then((r) => r.data),

  respond: (id: string, isAccepted: boolean) =>
    api
      .put<LoadSuggestion>(`/load-progression/suggestions/${id}`, { isAccepted })
      .then((r) => r.data),
}
