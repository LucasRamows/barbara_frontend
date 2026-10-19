import { api } from '@/lib/api'
import type { RewardRule } from '@/types/gifts.types'

export const rewardRulesService = {
  getAll: () => api.get<RewardRule[]>('/reward-rules').then(r => r.data),

  create: (data: {
    name: string
    type: string
    targetValue: number
    description?: string
    muscleGroup?: string
    isActive?: boolean
  }) => api.post<RewardRule>('/reward-rules', data).then(r => r.data),

  update: (
    id: string,
    data: Partial<{
      name: string
      type: string
      targetValue: number
      description: string
      muscleGroup: string
      isActive: boolean
    }>,
  ) => api.put<RewardRule>(`/reward-rules/${id}`, data).then(r => r.data),

  remove: (id: string) => api.delete(`/reward-rules/${id}`),
}
