import { api } from '@/lib/api'
import type { RewardAchievement, RewardProgress } from '@/types/gifts.types'

export const rewardAchievementsService = {
  check: (studentId: string) =>
    api.post(`/reward-achievements/check/${studentId}`).then(r => r.data),

  getAchievements: (studentId: string) =>
    api.get<RewardAchievement[]>('/reward-achievements', { params: { studentId } }).then(r => r.data),

  getProgress: (studentId: string) =>
    api.get<RewardProgress[]>('/reward-achievements/progress', { params: { studentId } }).then(r => r.data),

  acknowledge: (id: string) =>
    api.put<RewardAchievement>(`/reward-achievements/${id}/acknowledge`).then(r => r.data),
}
