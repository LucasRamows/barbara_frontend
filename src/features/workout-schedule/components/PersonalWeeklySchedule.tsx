import { useState } from 'react'
import { ChevronDown, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { usePersonalWorkoutSchedule } from '../hooks/use-personal-workout-schedule'
import {
  ALL_DAYS,
  DAY_LABELS,
  type DayOfWeek,
  type WorkoutSchedule,
} from '@/types/workout-plan.types'

interface PersonalWeeklyScheduleProps {
  studentId: string
}

export function PersonalWeeklySchedule({ studentId }: PersonalWeeklyScheduleProps) {
  const { schedulesQuery, plansQuery, assignMutation, removeMutation } =
    usePersonalWorkoutSchedule(studentId)
  const [assignDay, setAssignDay] = useState<DayOfWeek | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')

  const schedules = schedulesQuery.data ?? []
  const plans = plansQuery.data ?? []
  const scheduleByDay = Object.fromEntries(
    schedules.map((schedule) => [schedule.dayOfWeek, schedule])
  ) as Record<DayOfWeek, WorkoutSchedule | undefined>

  const openAssignment = (day: DayOfWeek, schedule?: WorkoutSchedule) => {
    setAssignDay(day)
    setSelectedPlan(schedule?.workoutPlanId ?? '')
  }

  const handleAssign = async () => {
    if (!assignDay || !selectedPlan) return
    const existing = scheduleByDay[assignDay]
    try {
      await assignMutation.mutateAsync({
        scheduleId: existing?.id,
        dto: {
          studentId,
          workoutPlanId: selectedPlan,
          dayOfWeek: assignDay,
        },
      })
      toast.success('Programação atualizada')
      setAssignDay(null)
      setSelectedPlan('')
    } catch {
      toast.error('Erro ao atribuir treino')
    }
  }

  const handleRemove = async (scheduleId: string) => {
    try {
      await removeMutation.mutateAsync(scheduleId)
      toast.success('Treino removido da semana')
    } catch {
      toast.error('Erro ao remover treino')
    }
  }

  if (schedulesQuery.isPending || plansQuery.isPending) {
    return (
      <div className="space-y-2 p-1">
        {ALL_DAYS.map((day) => (
          <Skeleton key={day} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (schedulesQuery.isError || plansQuery.isError) {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">
          Não foi possível carregar a programação semanal.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void schedulesQuery.refetch()
            void plansQuery.refetch()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ALL_DAYS.map((day) => {
        const schedule = scheduleByDay[day]
        const workoutDay = schedule?.workoutPlan.days.find((item) => item.dayOfWeek === day)

        return (
          <Collapsible key={day}>
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 p-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto min-w-0 flex-1 justify-between px-1 text-left"
                    disabled={!schedule}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {DAY_LABELS[day]}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {schedule?.workoutPlan.name ?? 'Sem treino'}
                      </span>
                    </span>
                    {schedule && <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
                  </Button>
                </CollapsibleTrigger>
                <Button variant="outline" size="sm" onClick={() => openAssignment(day, schedule)}>
                  {schedule ? 'Alterar' : 'Atribuir'}
                </Button>
                {schedule && (
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        Remover
                      </Button>
                    }
                    title="Remover treino da semana"
                    description={`O treino de ${DAY_LABELS[day]} será removido. Se estiver em andamento, a sessão também será encerrada.`}
                    confirmLabel="Remover treino"
                    loading={removeMutation.isPending}
                    onConfirm={() => handleRemove(schedule.id)}
                    destructive
                  />
                )}
              </div>

              {schedule && (
                <CollapsibleContent>
                  <Separator />
                  <div className="flex flex-col gap-2 p-3">
                    {!workoutDay?.exercises.length ? (
                      <p className="text-sm text-muted-foreground">
                        Esta ficha não possui exercícios para o dia.
                      </p>
                    ) : (
                      workoutDay.exercises.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-md bg-muted p-3"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Dumbbell className="size-4 shrink-0 text-primary" />
                            <span className="truncate text-sm text-foreground">
                              {item.exercise.name}
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-xs text-muted-foreground">
                            <span className="block">
                              {item.sets}x {item.minReps}–{item.maxReps}
                            </span>
                            <span className="block">
                              {item.weight == null
                                ? 'Carga livre'
                                : `${item.weight} ${item.weightUnit}`}
                            </span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              )}
            </div>
          </Collapsible>
        )
      })}

      <Dialog open={assignDay !== null} onOpenChange={(open) => !open && setAssignDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atribuir treino {assignDay ? `— ${DAY_LABELS[assignDay]}` : ''}
            </DialogTitle>
            <DialogDescription>Escolha a ficha de treino para este dia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ficha" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={handleAssign}
              disabled={!selectedPlan || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
