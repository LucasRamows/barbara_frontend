import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workoutPlansService } from '@/services/workout-plans/workout-plans.service'
import { workoutSchedulesService } from '@/services/workout-schedules/workout-schedules.service'
import type { CreateScheduleDto } from '@/services/workout-schedules/workout-schedules.service'

export function usePersonalWorkoutSchedule(studentId: string) {
  const queryClient = useQueryClient()
  const scheduleKey = ['personal-workout-schedule', studentId]

  const schedulesQuery = useQuery({
    queryKey: scheduleKey,
    queryFn: () => workoutSchedulesService.listForStudent(studentId),
  })

  const plansQuery = useQuery({
    queryKey: ['personal-workout-plans'],
    queryFn: workoutPlansService.list,
    select: (plans) => plans.filter((plan) => plan.isActive),
  })

  const assignMutation = useMutation({
    mutationFn: ({ scheduleId, dto }: { scheduleId?: string; dto: CreateScheduleDto }) =>
      scheduleId
        ? workoutSchedulesService.update(scheduleId, dto)
        : workoutSchedulesService.create(dto),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scheduleKey }),
        queryClient.invalidateQueries({ queryKey: ['student-workout-week'] }),
      ])
    },
  })

  const removeMutation = useMutation({
    mutationFn: workoutSchedulesService.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scheduleKey }),
        queryClient.invalidateQueries({ queryKey: ['student-workout-week'] }),
      ])
    },
  })

  return { schedulesQuery, plansQuery, assignMutation, removeMutation }
}
