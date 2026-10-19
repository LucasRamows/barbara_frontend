import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Dumbbell, Clock, MoreHorizontal } from 'lucide-react'
import { workoutPlansService } from '@/services/workout-plans/workout-plans.service'
import type { WorkoutPlan } from '@/types/workout-plan.types'
import { EmptyState } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function PlanCard({
  plan,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
}: {
  plan: WorkoutPlan
  onEdit: () => void
  onDuplicate: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  const dayCount = plan.days?.length ?? 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{plan.name}</p>
            <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-xs">
              {plan.isActive ? 'Ativa' : 'Arquivada'}
            </Badge>
          </div>
          {plan.description && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{plan.description}</p>
          )}
          {plan.objective && (
            <p className="mt-0.5 text-xs text-muted-foreground">Objetivo: {plan.objective}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggleActive}>
              {plan.isActive ? 'Arquivar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {plan.estimatedMinutes && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {plan.estimatedMinutes} min
          </span>
        )}
        <span>{dayCount} {dayCount === 1 ? 'dia' : 'dias'} configurados</span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={onEdit}>
          Editar ficha
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          Duplicar
        </Button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="size-8 rounded-md" />
      </div>
      <Skeleton className="h-4 w-56" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}

export default function PersonalWorkouts() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await workoutPlansService.list()
      setPlans(data)
    } catch {
      toast.error('Erro ao carregar fichas de treino')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDuplicate = async (id: string) => {
    try {
      await workoutPlansService.duplicate(id)
      toast.success('Ficha duplicada')
      load()
    } catch {
      toast.error('Erro ao duplicar ficha')
    }
  }

  const handleToggleActive = async (plan: WorkoutPlan) => {
    try {
      await workoutPlansService.update(plan.id, { isActive: !plan.isActive } as any)
      setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      toast.success(plan.isActive ? 'Ficha arquivada' : 'Ficha ativada')
    } catch {
      toast.error('Erro ao atualizar ficha')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await workoutPlansService.remove(id)
      setPlans((prev) => prev.filter((p) => p.id !== id))
      toast.success('Ficha excluída')
    } catch {
      toast.error('Erro ao excluir ficha')
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Fichas de treino</h1>
        <Button size="sm" onClick={() => navigate('/personal/treinos/novo')}>
          <Plus size={16} className="mr-1.5" />
          Nova ficha
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={48} strokeWidth={1} />}
          title="Nenhuma ficha criada ainda"
          description="Crie a primeira ficha de treino para seus alunos."
          action={
            <Button size="sm" onClick={() => navigate('/personal/treinos/novo')}>
              Criar primeira ficha
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => navigate(`/personal/treinos/${plan.id}`)}
              onDuplicate={() => handleDuplicate(plan.id)}
              onToggleActive={() => handleToggleActive(plan)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
