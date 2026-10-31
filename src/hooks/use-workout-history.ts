import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'

export function useWorkoutHistory(studentId?: string, month?: Date) {
  const from = month ? format(new Date(month.getFullYear(), month.getMonth(), 1), 'yyyy-MM-dd') : undefined
  const to = month ? format(new Date(month.getFullYear(), month.getMonth() + 1, 0), 'yyyy-MM-dd') : undefined
  return useQuery({
    queryKey: ['workout-history', studentId ?? 'me', from, to],
    queryFn: () => workoutSessionsService.getAll({ studentId, from, to, limit: 100 }),
  })
}
