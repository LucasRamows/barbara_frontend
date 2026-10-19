export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'CORE'
  | 'GLUTES'
  | 'QUADRICEPS'
  | 'HAMSTRINGS'
  | 'CALVES'
  | 'FULL_BODY'
  | 'OTHER'

export type WeightUnit = 'KG' | 'LB'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: 'Peitoral',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  FOREARMS: 'Antebraço',
  CORE: 'Core',
  GLUTES: 'Glúteos',
  QUADRICEPS: 'Quadríceps',
  HAMSTRINGS: 'Posterior de coxa',
  CALVES: 'Panturrilha',
  FULL_BODY: 'Corpo todo',
  OTHER: 'Outro',
}

export interface ExerciseImage {
  id: string
  url: string
  order: number
}

export interface Exercise {
  id: string
  name: string
  description?: string
  muscleGroup: MuscleGroup
  instructions?: string
  isUnilateral: boolean
  defaultSets: number
  minReps: number
  maxReps: number
  defaultWeight?: number
  weightUnit: WeightUnit
  restSeconds: number
  rpeTarget?: number
  progressionEnabled: boolean
  suggestedIncrement?: number
  notes?: string
  isActive: boolean
  images: ExerciseImage[]
  createdAt: string
}
