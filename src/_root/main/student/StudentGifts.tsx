import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useStudentRewards } from '@/hooks/use-student-rewards'
import { RULE_TYPE_LABELS } from '@/types/gifts.types'

function SectionState({ loading, error, empty, children }: { loading: boolean; error: boolean; empty: boolean; children: React.ReactNode }) {
  if (loading) return <><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></>
  if (error) return <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar esta seção. Tente novamente.</p>
  if (empty) return <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
  return <>{children}</>
}

export default function StudentGifts() {
  const { profileId, loading: profileLoading } = useStudentProfile()
  const rewards = useStudentRewards(profileId ?? undefined)
  const acknowledge = async (id: string) => {
    try {
      await rewards.acknowledge.mutateAsync(id)
      toast.success('Conquista reconhecida!')
    } catch {
      toast.error('Erro ao reconhecer conquista')
    }
  }
  const progressItems = rewards.progress.data ?? []
  const achievements = rewards.achievements.data ?? []
  return (
    <div className="flex flex-col gap-6 p-4 pb-6">
      <div><h1 className="font-display text-2xl font-bold text-foreground">Gifts</h1><p className="mt-1 text-sm text-muted-foreground">Sua jornada, conquistas e prêmios.</p></div>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Prêmios entregues</h2>
        <SectionState loading={profileLoading || rewards.gifts.isPending} error={rewards.gifts.isError} empty={!rewards.gifts.data?.length}>
          {(rewards.gifts.data ?? []).map((gift) => <Card key={gift.id}><CardContent className="flex gap-4 p-4">{gift.imageUrl && <img src={gift.imageUrl} alt="" className="size-16 rounded-lg object-cover" loading="lazy" />}<div><p className="font-semibold text-card-foreground">{gift.title}</p>{gift.description && <p className="text-sm text-muted-foreground">{gift.description}</p>}<Badge className="mt-2 border border-success/30 bg-success/15 text-success">{gift.isDelivered ? 'Entregue' : 'A caminho'}</Badge></div></CardContent></Card>)}
        </SectionState>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Próximos objetivos</h2>
        <SectionState loading={profileLoading || rewards.progress.isPending} error={rewards.progress.isError} empty={!progressItems.length}>
          {progressItems.map((item) => {
            const target = item.rule.targetValue
            const percentage = target && target > 0 ? Math.min(100, Math.round(item.currentValue / target * 100)) : null
            return <div key={item.id} className="rounded-xl border border-border bg-card p-4"><div className="flex justify-between gap-3"><p className="font-medium text-card-foreground">{item.rule.name}</p>{item.isComplete && <Badge className="border border-success/30 bg-success/15 text-success">Concluído</Badge>}</div>{item.rule.description && <p className="mt-1 text-sm text-muted-foreground">{item.rule.description}</p>}<p className="mt-2 text-xs text-muted-foreground">{percentage == null ? 'Meta sem alvo numérico' : `${item.currentValue} / ${target} · ${RULE_TYPE_LABELS[item.rule.type]}`}</p>{percentage != null && <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>}</div>
          })}
        </SectionState>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Conquistas</h2>
        <SectionState loading={profileLoading || rewards.achievements.isPending} error={rewards.achievements.isError} empty={!achievements.length}>
          {achievements.map((achievement) => {
            const awaitingRecognition = ['PENDING', 'ACHIEVED'].includes(achievement.status)
            return <Card key={achievement.id} className={awaitingRecognition ? 'border-primary/40 ring-2 ring-primary/30' : 'opacity-70'}><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-card-foreground">{achievement.rule.name}</p>{achievement.rule.description && <p className="text-sm text-muted-foreground">{achievement.rule.description}</p>}{achievement.achievedAt && <p className="mt-1 text-xs text-muted-foreground">{new Date(achievement.achievedAt).toLocaleDateString('pt-BR')}</p>}</div>{awaitingRecognition ? <Button size="sm" onClick={() => acknowledge(achievement.id)} disabled={rewards.acknowledge.isPending}>Reconhecer</Button> : <span className="text-success" aria-label="Reconhecida">✓</span>}</div></CardContent></Card>
          })}
        </SectionState>
      </section>
    </div>
  )
}
