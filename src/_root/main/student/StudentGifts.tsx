import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { giftsService } from '@/services/gifts/gifts.service'
import { rewardAchievementsService } from '@/services/reward-achievements/reward-achievements.service'
import type { Gift, RewardAchievement, RewardProgress } from '@/types/gifts.types'
import { RULE_TYPE_LABELS } from '@/types/gifts.types'

function GiftSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-3 h-6 w-20" />
      </CardContent>
    </Card>
  )
}

export default function StudentGifts() {
  const { profileId, loading: profileLoading } = useStudentProfile()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [achievements, setAchievements] = useState<RewardAchievement[]>([])
  const [progress, setProgress] = useState<RewardProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return
    Promise.all([
      giftsService.getAll(profileId),
      rewardAchievementsService.getAchievements(profileId),
      rewardAchievementsService.getProgress(profileId),
    ])
      .then(([g, a, p]) => {
        setGifts(g)
        setAchievements(a)
        setProgress(p)
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false))
  }, [profileId])

  async function handleAcknowledge(id: string) {
    setAcknowledging(id)
    try {
      const updated = await rewardAchievementsService.acknowledge(id)
      setAchievements(prev => prev.map(a => (a.id === id ? updated : a)))
      toast.success('Conquista reconhecida!')
    } catch {
      toast.error('Erro ao reconhecer conquista')
    } finally {
      setAcknowledging(null)
    }
  }

  const isLoading = profileLoading || loading

  return (
    <div className="flex flex-col gap-6 p-4 pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Gifts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Presentes e conquistas do seu progresso.</p>
      </div>

      {/* Presentes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Presentes</h2>

        {isLoading ? (
          <>
            <GiftSkeleton />
            <GiftSkeleton />
            <GiftSkeleton />
          </>
        ) : gifts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
            <span className="text-4xl">🏆</span>
            <p className="text-sm font-medium text-foreground">Nenhum presente ainda</p>
            <p className="text-xs text-muted-foreground">Continue treinando!</p>
          </div>
        ) : (
          gifts.map(gift => (
            <Card
              key={gift.id}
              className={gift.isDelivered ? '' : 'ring-2 ring-primary/30 shadow-md shadow-primary/10'}
            >
              <CardContent className="flex gap-4 p-4">
                {gift.imageUrl && (
                  <img
                    src={gift.imageUrl}
                    alt={gift.title}
                    className="size-16 rounded-lg object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-semibold text-foreground">{gift.title}</p>
                  {gift.description && (
                    <p className="text-sm text-muted-foreground">{gift.description}</p>
                  )}
                  <div className="mt-1">
                    {gift.isDelivered ? (
                      <Badge className="bg-success/15 text-success">
                        Entregue{gift.deliveredAt && ` · ${new Date(gift.deliveredAt).toLocaleDateString('pt-BR')}`}
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/15 text-status-warning-emphasis">
                        A caminho
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Conquistas */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Conquistas</h2>

        {isLoading ? (
          <>
            <GiftSkeleton />
            <GiftSkeleton />
          </>
        ) : achievements.length === 0 && progress.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
            <span className="text-4xl">🎯</span>
            <p className="text-sm font-medium text-foreground">Nenhuma conquista ainda</p>
            <p className="text-xs text-muted-foreground">Continue evoluindo para desbloquear conquistas!</p>
          </div>
        ) : (
          <>
            {achievements.map(a => (
              <Card
                key={a.id}
                className={a.status === 'PENDING' ? 'ring-2 ring-primary/30 shadow-md shadow-primary/10' : 'opacity-70'}
              >
                <CardContent className="p-4">
                  {a.status === 'PENDING' && (
                    <p className="mb-2 text-sm font-semibold text-primary">🎉 Nova conquista!</p>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{a.rule.name}</p>
                      {a.rule.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{a.rule.description}</p>
                      )}
                      {a.achievedAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(a.achievedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    {a.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledge(a.id)}
                        disabled={acknowledging === a.id}
                      >
                        {acknowledging === a.id ? 'Aguarde...' : 'Reconhecer'}
                      </Button>
                    ) : (
                      <span className="text-xl">✅</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {progress.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Progresso
                </h3>
                {progress.map(p => {
                  const pct = Math.min(100, Math.round((p.currentValue / p.rule.targetValue) * 100))
                  return (
                    <div key={p.id} className="rounded-xl border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{p.rule.name}</p>
                        {p.isComplete ? (
                          <Badge className="bg-success/15 text-success">
                            Conquistado!
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {p.currentValue} / {p.rule.targetValue}{' '}
                            {RULE_TYPE_LABELS[p.rule.type]}
                          </span>
                        )}
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
