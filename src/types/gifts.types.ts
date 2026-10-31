export interface Gift {
  id: string
  studentId: string
  personalId: string
  title: string
  description: string | null
  imageUrl: string | null
  isDelivered: boolean
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

export type RewardRuleType =
  | 'TOTAL_WORKOUTS'
  | 'WORKOUT_STREAK'
  | 'WORKOUT_FREQUENCY'
  | 'LOAD_INCREASE'
  | 'EXERCISE_GOAL'
  | 'SPECIFIC_WORKOUT'
  | 'BODY_MEASUREMENT'
  | 'CUSTOM'

export interface RewardRule {
  id: string
  personalId: string
  name: string
  description: string | null
  type: RewardRuleType
  targetValue: number | null
  muscleGroup: string | null
  isActive: boolean
  createdAt: string
}

export interface RewardProgress {
  id: string
  studentId: string
  ruleId: string
  rule: RewardRule
  currentValue: number
  isComplete: boolean
  completedAt: string | null
  updatedAt: string
}

export interface RewardAchievement {
  id: string
  studentId: string
  ruleId: string
  rule: RewardRule
  status:
    | 'IN_PROGRESS'
    | 'ACHIEVED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'PENDING'
    | 'ACKNOWLEDGED'
  achievedAt: string | null
  acknowledgedAt: string | null
  createdAt: string
}

export interface AdminStats {
  totalPersonals: number
  totalStudents: number
  totalSessions: number
  sessionsThisWeek: number
  pendingSuggestions: number
}

export const RULE_TYPE_LABELS: Record<RewardRuleType, string> = {
  TOTAL_WORKOUTS: 'Total de treinos',
  WORKOUT_STREAK: 'Sequência de treinos',
  WORKOUT_FREQUENCY: 'Frequência semanal',
  LOAD_INCREASE: 'Aumento de carga',
  EXERCISE_GOAL: 'Meta em exercício',
  SPECIFIC_WORKOUT: 'Conclusão de treino',
  BODY_MEASUREMENT: 'Meta de medida',
  CUSTOM: 'Personalizado',
}
