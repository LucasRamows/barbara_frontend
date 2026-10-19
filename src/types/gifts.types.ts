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
  | 'SESSIONS_COUNT'
  | 'STREAK_WEEKS'
  | 'WEIGHT_MILESTONE'
  | 'CONSISTENCY_PERCENT'
  | 'CUSTOM'

export interface RewardRule {
  id: string
  personalId: string
  name: string
  description: string | null
  type: RewardRuleType
  targetValue: number
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
  status: 'PENDING' | 'ACKNOWLEDGED'
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
  SESSIONS_COUNT: 'Sessões',
  STREAK_WEEKS: 'Semanas consecutivas',
  WEIGHT_MILESTONE: 'Marco de carga',
  CONSISTENCY_PERCENT: 'Consistência',
  CUSTOM: 'Personalizado',
}
