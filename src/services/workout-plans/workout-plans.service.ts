import { api } from '@/lib/api'
import type { DayOfWeek, WorkoutPlan, WorkoutPlanDay, WorkoutExercise } from '@/types/workout-plan.types'
import type { WeightUnit } from '@/types/exercise.types'

export interface CreateWorkoutPlanDto {
  name: string
  description?: string
  objective?: string
  estimatedMinutes?: number
}

export interface CreatePlanDayDto {
  dayOfWeek: DayOfWeek
  label?: string
  order?: number
}

export interface AddExerciseToDayDto {
  exerciseId: string
  order?: number
  sets?: number
  minReps?: number
  maxReps?: number
  weight?: number
  weightUnit?: WeightUnit
  restSeconds?: number
  rpeTarget?: number
  notes?: string
  progressionEnabled?: boolean
}

export interface UpdateWorkoutExerciseDto {
  sets?: number
  minReps?: number
  maxReps?: number
  weight?: number
  weightUnit?: WeightUnit
  restSeconds?: number
  rpeTarget?: number
  notes?: string
  progressionEnabled?: boolean
}

export interface ReorderItem {
  id: string
  order: number
}

export const workoutPlansService = {
  async list(): Promise<WorkoutPlan[]> {
    const { data } = await api.get<WorkoutPlan[]>('/workout-plans')
    return data.map((plan) => ({ ...plan, days: plan.days ?? [] }))
  },

  async get(id: string): Promise<WorkoutPlan> {
    const { data } = await api.get<WorkoutPlan>(`/workout-plans/${id}`)
    return data
  },

  async create(dto: CreateWorkoutPlanDto): Promise<WorkoutPlan> {
    const { data } = await api.post<WorkoutPlan>('/workout-plans', dto)
    return data
  },

  async update(id: string, dto: Partial<CreateWorkoutPlanDto>): Promise<WorkoutPlan> {
    const { data } = await api.put<WorkoutPlan>(`/workout-plans/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/workout-plans/${id}`)
  },

  async duplicate(id: string): Promise<WorkoutPlan> {
    const { data } = await api.post<WorkoutPlan>(`/workout-plans/${id}/duplicate`)
    return data
  },

  async addDay(planId: string, dto: CreatePlanDayDto): Promise<WorkoutPlanDay> {
    const { data } = await api.post<WorkoutPlanDay>(`/workout-plans/${planId}/days`, dto)
    return data
  },

  async updateDay(
    planId: string,
    dayId: string,
    dto: Partial<CreatePlanDayDto>,
  ): Promise<WorkoutPlanDay> {
    const { data } = await api.put<WorkoutPlanDay>(
      `/workout-plans/${planId}/days/${dayId}`,
      dto,
    )
    return data
  },

  async removeDay(planId: string, dayId: string): Promise<void> {
    await api.delete(`/workout-plans/${planId}/days/${dayId}`)
  },

  async addExercise(
    planId: string,
    dayId: string,
    dto: AddExerciseToDayDto,
  ): Promise<WorkoutExercise> {
    const { data } = await api.post<WorkoutExercise>(
      `/workout-plans/${planId}/days/${dayId}/exercises`,
      dto,
    )
    return data
  },

  async updateExercise(
    planId: string,
    dayId: string,
    workoutExId: string,
    dto: UpdateWorkoutExerciseDto,
  ): Promise<WorkoutExercise> {
    const { data } = await api.put<WorkoutExercise>(
      `/workout-plans/${planId}/days/${dayId}/exercises/${workoutExId}`,
      dto,
    )
    return data
  },

  async removeExercise(planId: string, dayId: string, workoutExId: string): Promise<void> {
    await api.delete(`/workout-plans/${planId}/days/${dayId}/exercises/${workoutExId}`)
  },

  async reorderExercises(
    planId: string,
    dayId: string,
    items: ReorderItem[],
  ): Promise<void> {
    await api.put(`/workout-plans/${planId}/days/${dayId}/exercises/reorder`, { items })
  },
}
