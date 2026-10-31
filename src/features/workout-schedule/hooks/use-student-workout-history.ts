import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import type { SessionSummary } from '@/types/session.types'

export interface WorkoutHistoryGroup {
  month: string
  sessions: SessionSummary[]
}

function groupSessionsByMonth(sessions: SessionSummary[]): WorkoutHistoryGroup[] {
  const groups = new Map<string, SessionSummary[]>()

  sessions.forEach((session) => {
    const month = format(new Date(session.startedAt), 'MMMM yyyy', {
      locale: ptBR,
    })
    groups.set(month, [...(groups.get(month) ?? []), session])
  })

  return Array.from(groups, ([month, groupedSessions]) => ({
    month,
    sessions: groupedSessions,
  }))
}

export function useStudentWorkoutHistory(studentId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['personal-student-workout-history', studentId]

  const historyQuery = useQuery({
    queryKey,
    queryFn: () => workoutSessionsService.getAll({ studentId, limit: 100 }),
    select: (result) => ({
      total: result.total,
      groups: groupSessionsByMonth(result.data),
    }),
  })

  const removeMutation = useMutation({
    mutationFn: workoutSessionsService.removeFromHistory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ['student-workout-week'] }),
        queryClient.invalidateQueries({ queryKey: ['active-workout-session'] }),
      ])
    },
  })

  return { historyQuery, removeMutation }
}
