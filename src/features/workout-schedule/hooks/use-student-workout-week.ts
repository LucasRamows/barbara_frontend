import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workoutPlansService } from '@/services/workout-plans/workout-plans.service'
import { workoutSchedulesService } from '@/services/workout-schedules/workout-schedules.service'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import type { WorkoutPlan } from '@/types/workout-plan.types'

export function useStudentWorkoutWeek(referenceDate?: string | Date) {
  const queryClient = useQueryClient()
  const referenceDateKey = referenceDate instanceof Date
    ? [
        referenceDate.getFullYear(),
        String(referenceDate.getMonth() + 1).padStart(2, '0'),
        String(referenceDate.getDate()).padStart(2, '0'),
      ].join('-')
    : referenceDate?.slice(0, 10) ?? 'current'

  const weekQuery = useQuery({
    queryKey: ['student-workout-week', referenceDateKey],
    queryFn: () => workoutSchedulesService.getMyWeek(referenceDate),
  })

  const activeSessionQuery = useQuery({
    queryKey: ['active-workout-session'],
    queryFn: workoutSessionsService.getActive,
    refetchInterval: 30_000,
  })

  const plansQuery = useQuery({
    queryKey: ['student-workout-plans'],
    queryFn: workoutPlansService.list,
    enabled: false,
    select: (plans: WorkoutPlan[]) => plans.filter((plan) => plan.isActive),
  })

  const startSessionMutation = useMutation({
    mutationFn: workoutSessionsService.start,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['student-workout-week'] })
      void queryClient.invalidateQueries({ queryKey: ['active-workout-session'] })
    },
  })

  return {
    weekQuery,
    activeSessionQuery,
    plansQuery,
    startSessionMutation,
  }
}
