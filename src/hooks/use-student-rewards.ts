import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { giftsService } from '@/services/gifts/gifts.service'
import { rewardAchievementsService } from '@/services/reward-achievements/reward-achievements.service'

export function useStudentRewards(studentId?: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(studentId)
  const gifts = useQuery({
    queryKey: ['gifts', studentId],
    enabled,
    queryFn: () => giftsService.getAll(studentId!),
  })
  const achievements = useQuery({
    queryKey: ['reward-achievements', studentId],
    enabled,
    queryFn: () => rewardAchievementsService.getAchievements(studentId!),
  })
  const progress = useQuery({
    queryKey: ['reward-progress', studentId],
    enabled,
    queryFn: () => rewardAchievementsService.getProgress(studentId!),
  })
  const acknowledge = useMutation({
    mutationFn: rewardAchievementsService.acknowledge,
    onSuccess: (updated) => {
      queryClient.setQueryData<typeof updated[]>(['reward-achievements', studentId], (current) =>
        current?.map((item) => item.id === updated.id ? updated : item),
      )
    },
  })
  return { gifts, achievements, progress, acknowledge }
}
