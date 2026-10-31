import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Dumbbell, Play } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { DAY_LABELS } from '@/types/workout-plan.types'
import type { WeeklyWorkoutDay, WeeklyWorkoutSchedule } from '@/types/workout-plan.types'

interface StudentWeeklyAgendaProps {
  days: WeeklyWorkoutDay[]
  weekStart: string
  weekEnd: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
  onResumeWorkout: (sessionId: string) => void
  startingScheduleId?: string
  onStartWorkout: (schedule: WeeklyWorkoutSchedule) => void
}

const STATUS_LABELS = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
} as const

function formatLoad(weight: number | null | undefined, unit: string) {
  return weight == null ? 'Carga livre' : `${weight} ${unit}`
}

function isToday(date: string) {
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  return date === today
}

export function StudentWeeklyAgenda({
  days,
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onResumeWorkout,
  startingScheduleId,
  onStartWorkout,
}: StudentWeeklyAgendaProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-primary" />
            Sua semana
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onPreviousWeek} aria-label="Semana anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCurrentWeek}>Hoje</Button>
            <Button variant="ghost" size="icon" onClick={onNextWeek} aria-label="Próxima semana">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(weekStart), 'dd MMM', { locale: ptBR })} - {format(parseISO(weekEnd), 'dd MMM yyyy', { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {days.map((day) => {
          const workoutDay = day.schedule?.workoutDay
          const today = isToday(day.date)

          return (
            <Collapsible key={day.date} defaultOpen={today}>
              <div className={`rounded-xl border bg-card transition-colors ${today ? 'border-primary/50 shadow-sm shadow-primary/10' : 'border-border'}`}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-between gap-3 px-3 py-3 text-left"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-xl text-xs ${today ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <span className="font-semibold">{parseISO(day.date).getDate()}</span>
                        {today && <span className="font-semibold">Hoje</span>}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {DAY_LABELS[day.dayOfWeek]}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {day.schedule?.workoutPlan.name ?? 'Descanso'}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {day.session && (
                        <Badge className={day.session.status === 'COMPLETED' ? 'border-success/30 bg-success/15 text-success' : 'border-primary/30 bg-primary/10 text-primary'}>
                          {STATUS_LABELS[day.session.status]}
                        </Badge>
                      )}
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </span>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator />
                  {!day.schedule || !workoutDay ? (
                    <p className="p-4 text-sm text-muted-foreground">
                      Nenhum treino programado para este dia.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 p-4">
                      {day.schedule.workoutPlan.objective && (
                        <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                          {day.schedule.workoutPlan.objective}
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        {workoutDay.exercises.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Dumbbell className="size-4 shrink-0 text-primary" />
                              <span className="truncate text-sm font-medium text-foreground">
                                {item.exercise.name}
                              </span>
                            </span>
                            <span className="shrink-0 text-right text-xs text-muted-foreground">
                              <span className="block">
                                {item.sets}x {item.minReps}–{item.maxReps}
                              </span>
                              <span className="block">
                                {formatLoad(item.weight, item.weightUnit)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {today && day.session?.status === 'IN_PROGRESS' && (
                        <Button
                          className="w-full gap-2"
                          onClick={() => onResumeWorkout(day.session!.id)}
                        >
                          <Play className="size-4 fill-current" />
                          Retomar treino
                        </Button>
                      )}
                      {today && !day.session && (
                        <Button
                          className="w-full gap-2"
                          onClick={() => onStartWorkout(day.schedule!)}
                          disabled={startingScheduleId === day.schedule.id}
                        >
                          <Play className="size-4 fill-current" />
                          {startingScheduleId === day.schedule.id
                            ? 'Iniciando...'
                            : 'Iniciar treino'}
                        </Button>
                      )}
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })}
      </CardContent>
    </Card>
  )
}
