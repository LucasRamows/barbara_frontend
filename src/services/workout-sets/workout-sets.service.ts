import { api } from '@/lib/api'

export const workoutSetsService = {
  update: (
    setId: string,
    data: {
      completedReps?: number
      usedWeight?: number
      rpe?: number
      isCompleted?: boolean
      notes?: string
    },
  ) => api.put(`/workout-sets/${setId}`, data).then((r) => r.data),

  addExtra: (sessionExerciseId: string) =>
    api.post(`/workout-sets/${sessionExerciseId}/extra`).then((r) => r.data),
}
