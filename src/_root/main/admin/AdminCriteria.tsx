import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { rewardRulesService } from '@/services/reward-rules/reward-rules.service'
import type { RewardRule } from '@/types/gifts.types'
import { RULE_TYPE_LABELS } from '@/types/gifts.types'

export default function AdminCriteria() {
  const [rules, setRules] = useState<RewardRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rewardRulesService.getAll()
      .then(setRules)
      .catch(() => toast.error('Erro ao carregar critérios'))
      .finally(() => setLoading(false))
  }, [])

  // Group by personalId
  const grouped = rules.reduce<Record<string, RewardRule[]>>((acc, rule) => {
    const key = rule.personalId
    if (!acc[key]) acc[key] = []
    acc[key].push(rule)
    return acc
  }, {})

  const totalActive = rules.filter(r => r.isActive).length

  const typeCounts = rules.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Critérios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          As regras são criadas por cada personal. Aqui você visualiza todas as regras da plataforma.
        </p>
      </div>

      {/* Summary stats */}
      {!loading && rules.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="font-display text-2xl font-bold text-primary">{totalActive}</p>
            <p className="text-xs text-muted-foreground">Regras ativas</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{rules.length}</p>
            <p className="text-xs text-muted-foreground">Total de regras</p>
          </div>
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="rounded-lg border bg-card px-4 py-2 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{RULE_TYPE_LABELS[type as keyof typeof RULE_TYPE_LABELS] ?? type}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm font-medium text-foreground">Nenhuma regra criada ainda</p>
          <p className="text-xs text-muted-foreground">Os personals criam regras em suas contas.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([personalId, personalRules]) => (
          <div key={personalId} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal · {personalId.slice(0, 8)}...
            </h2>
            {personalRules.map(rule => (
              <div key={rule.id} className="rounded-xl border bg-card p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{rule.name}</p>
                  <Badge variant="secondary">{RULE_TYPE_LABELS[rule.type]}</Badge>
                  {!rule.isActive && <Badge variant="outline">Inativa</Badge>}
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Alvo: {rule.targetValue}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
