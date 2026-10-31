export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELLED'

export interface WorkoutSetData {
  id: string
  setNumber: number
  plannedReps: number
  completedReps: number | null
  plannedWeight: number | null
  usedWeight: number | null
  weightUnit: 'KG' | 'LB'
  rpe: number | null
  isCompleted: boolean
  notes: string | null
  completedAt: string | null
}

export interface SessionExercise {
  id: string
  exerciseId: string
  exerciseName: string
  exerciseSnapshot: {
    name: string
    muscleGroup: string
    instructions?: string
    imageUrl?: string
    minReps: number
    maxReps: number
    restSeconds: number
    rpeTarget?: number
  }
  order: number
  isCompleted: boolean
  sets: WorkoutSetData[]
}

export interface WorkoutSession {
  id: string
  workoutPlanId: string | null
  planSnapshot: {
    planName: string
    dayLabel?: string
    dayOfWeek: string
  }
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
  status: SessionStatus
  partialReason: string | null
  isDeload: boolean
  exercises: SessionExercise[]
}

export interface SessionSummary {
  id: string
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
  status: SessionStatus
  isDeload: boolean
  planSnapshot: { planName: string }
  planName?: string | null
}

export interface LoadSuggestion {
  id: string
  exerciseId: string
  exerciseName?: string
  currentWeight: number
  suggestedWeight: number
  weightUnit?: string
  justification: string
  isAccepted: boolean | null
  createdAt: string
}

export interface DeloadPeriod {
  id: string
  studentId: string
  startDate: string
  endDate: string
  reductionPercent: number
  reason: string | null
  observations: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export interface ExerciseHistoryPoint {
  sessionId: string
  date: string
  isDeload: boolean
  sets: {
    setNumber: number
    usedWeight: number | null
    completedReps: number | null
    rpe: number | null
  }[]
  maxWeight: number | null
}
