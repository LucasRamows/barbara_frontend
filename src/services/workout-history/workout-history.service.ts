import { api } from '@/lib/api'
import type { ExerciseHistoryPoint } from '@/types/session.types'

export const workoutHistoryService = {
  getExerciseHistory: (exerciseId: string, studentId?: string) =>
    api
      .get<ExerciseHistoryPoint[]>('/workout-history/exercise', {
        params: { exerciseId, studentId },
      })
      .then((r) => r.data),
}
