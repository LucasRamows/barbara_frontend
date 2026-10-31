import type { Exercise, WeightUnit } from './exercise.types'
import type { SessionStatus } from './session.types'

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
  weight?: number | null
  weightUnit: WeightUnit
  restSeconds: number
  rpeTarget?: number | null
  notes?: string | null
  progressionEnabled: boolean
  exercise: Exercise
}

export interface WorkoutPlanDay {
  id: string
  dayOfWeek: DayOfWeek
  label?: string | null
  order: number
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string | null
  objective?: string | null
  estimatedMinutes?: number | null
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
  validFrom?: string | null
  validUntil?: string | null
  workoutPlan: WorkoutPlan
}

export interface WeeklyWorkoutSession {
  id: string
  scheduledPlanId: string | null
  planSnapshot: {
    planName?: string
    dayId?: string
    dayLabel?: string
  }
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
  status: SessionStatus
}

export interface WeeklyWorkoutSchedule {
  id: string
  validFrom: string | null
  validUntil: string | null
  workoutPlan: Pick<WorkoutPlan, 'id' | 'name' | 'description' | 'objective' | 'estimatedMinutes'>
  workoutDay: WorkoutPlanDay | null
}

export interface WeeklyWorkoutDay {
  date: string
  dayOfWeek: DayOfWeek
  schedule: WeeklyWorkoutSchedule | null
  session: WeeklyWorkoutSession | null
}

export interface StudentWorkoutWeek {
  weekStart: string
  weekEnd: string
  days: WeeklyWorkoutDay[]
}
