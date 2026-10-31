import { api } from '@/lib/api'
import type { WorkoutSession, SessionSummary } from '@/types/session.types'

export const workoutSessionsService = {
  start: (data: { workoutPlanId: string; workoutPlanDayId: string; scheduledPlanId?: string }) =>
    api.post<WorkoutSession>('/workout-sessions/start', data).then((r) => r.data),

  getActive: () =>
    api
      .get<{ session: WorkoutSession | null }>('/workout-sessions/active')
      .then((r) => r.data.session),

  getOne: (id: string) => api.get<WorkoutSession>(`/workout-sessions/${id}`).then((r) => r.data),

  getAll: (params?: {
    studentId?: string
    from?: string
    to?: string
    status?: string
    page?: number
    limit?: number
    sort?: 'startedAt.asc' | 'startedAt.desc'
  }) =>
    api
      .get<{ data: SessionSummary[]; total: number }>('/workout-sessions', { params })
      .then((r) => r.data),

  getCalendar: (month: string, studentId?: string) =>
    api
      .get<Record<string, SessionSummary[]>>(
        '/workout-sessions/calendar',
        { params: { month, studentId } },
      )
      .then((r) => r.data),

  finish: (id: string, data?: { isPartial?: boolean; partialReason?: string }) =>
    api.put<WorkoutSession>(`/workout-sessions/${id}/finish`, data ?? {}).then((r) => r.data),

  abandon: (id: string) => api.delete(`/workout-sessions/${id}`),

  removeFromHistory: (id: string) => api.delete(`/workout-sessions/${id}/history`),
}
