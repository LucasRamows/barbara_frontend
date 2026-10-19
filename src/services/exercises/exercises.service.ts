import { api } from '@/lib/api'
import type { Exercise, ExerciseImage, MuscleGroup, WeightUnit } from '@/types/exercise.types'

export interface CreateExerciseDto {
  name: string
  muscleGroup: MuscleGroup
  description?: string
  instructions?: string
  isUnilateral?: boolean
  defaultSets?: number
  minReps?: number
  maxReps?: number
  defaultWeight?: number
  weightUnit?: WeightUnit
  restSeconds?: number
  rpeTarget?: number
  progressionEnabled?: boolean
  suggestedIncrement?: number
  notes?: string
}

export type UpdateExerciseDto = Partial<CreateExerciseDto>

export const exercisesService = {
  async list(): Promise<Exercise[]> {
    const { data } = await api.get<Exercise[]>('/exercises')
    return data
  },

  async get(id: string): Promise<Exercise> {
    const { data } = await api.get<Exercise>(`/exercises/${id}`)
    return data
  },

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    const { data } = await api.post<Exercise>('/exercises', dto)
    return data
  },

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    const { data } = await api.put<Exercise>(`/exercises/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`)
  },

  async uploadImage(id: string, file: File): Promise<ExerciseImage> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<ExerciseImage>(`/exercises/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async removeImage(exerciseId: string, imageId: string): Promise<void> {
    await api.delete(`/exercises/${exerciseId}/images/${imageId}`)
  },
}
