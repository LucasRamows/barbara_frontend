import type { Exercise, WeightUnit } from './exercise.types'

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
}

export const ALL_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export interface WorkoutExercise {
  id: string
  exerciseId: string
  order: number
  sets: number
  minReps: number
  maxReps: number
  weight?: number
  weightUnit: WeightUnit
  restSeconds: number
  rpeTarget?: number
  notes?: string
  progressionEnabled: boolean
  exercise: Exercise
}

export interface WorkoutPlanDay {
  id: string
  dayOfWeek: DayOfWeek
  label?: string
  order: number
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string
  objective?: string
  estimatedMinutes?: number
  isActive: boolean
  version: number
  days: WorkoutPlanDay[]
  createdAt: string
}

export interface WorkoutSchedule {
  id: string
  studentId: string
  workoutPlanId: string
  dayOfWeek: DayOfWeek
  isActive: boolean
  workoutPlan: Pick<WorkoutPlan, 'id' | 'name' | 'objective'>
}
