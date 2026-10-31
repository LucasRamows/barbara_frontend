import { useState } from 'react'
import { addDays, subDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Dumbbell, Info, RotateCcw, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/contexts/SessionContext'
import { StudentWeeklyAgenda } from '@/features/workout-schedule/components/StudentWeeklyAgenda'
import { useStudentWorkoutWeek } from '@/features/workout-schedule/hooks/use-student-workout-week'
import { cn } from '@/lib/utils'
import type { WeeklyWorkoutSchedule, WorkoutPlan } from '@/types/workout-plan.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: string } } }
  return apiError.response?.data?.message ?? fallback
}

export default function StudentToday() {
  const { user } = useSession()
  const navigate = useNavigate()
  const [pickPlanOpen, setPickPlanOpen] = useState(false)
  const [startingScheduleId, setStartingScheduleId] = useState<string>()
  const [referenceDate, setReferenceDate] = useState(() => new Date())
  const { weekQuery, activeSessionQuery, plansQuery, startSessionMutation } =
    useStudentWorkoutWeek(referenceDate)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const week = weekQuery.data
  const activeSession = activeSessionQuery.data
  const plans = plansQuery.data ?? []
  const completedWorkouts =
    week?.days.filter(
      (day) => day.session?.status === 'COMPLETED' || day.session?.status === 'PARTIAL'
    ).length ?? 0
  const weeklyGoal = 3

  const handleStartSchedule = async (schedule: WeeklyWorkoutSchedule) => {
    if (!schedule.workoutDay) {
      toast.error('Este dia ainda não possui exercícios configurados')
      return
    }
    setStartingScheduleId(schedule.id)
    try {
      const session = await startSessionMutation.mutateAsync({
        workoutPlanId: schedule.workoutPlan.id,
        workoutPlanDayId: schedule.workoutDay.id,
        scheduledPlanId: schedule.id,
      })
      navigate(`/sessao/${session.id}`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Erro ao iniciar treino'))
    } finally {
      setStartingScheduleId(undefined)
    }
  }

  const handleOpenPlanPicker = () => {
    setPickPlanOpen(true)
    void plansQuery.refetch()
  }

  const handleStartFromPlan = async (plan: WorkoutPlan) => {
    const workoutDay = plan.days[0]
    if (!workoutDay) {
      toast.error('Ficha sem dias configurados')
      return
    }
    try {
      setPickPlanOpen(false)
      const session = await startSessionMutation.mutateAsync({
        workoutPlanId: plan.id,
        workoutPlanDayId: workoutDay.id,
      })
      navigate(`/sessao/${session.id}`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Erro ao iniciar treino'))
    }
  }

  if (weekQuery.isPending || activeSessionQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <main className="flex flex-col gap-5 p-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{todayLabel}</p>
      </header>

      {activeSession && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/15">
              <RotateCcw className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Treino em andamento</p>
              <p className="truncate text-xs text-muted-foreground">
                {activeSession.planSnapshot?.planName}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate(`/sessao/${activeSession.id}`)}>
              Retomar
            </Button>
          </CardContent>
        </Card>
      )}

      {weekQuery.isError ? (
        <EmptyState
          icon={<Dumbbell size={48} strokeWidth={1} />}
          title="Não foi possível carregar sua semana"
          description="Verifique sua conexão e tente novamente."
          action={
            <Button size="sm" onClick={() => weekQuery.refetch()}>
              Tentar novamente
            </Button>
          }
        />
      ) : (
        week && (
          <StudentWeeklyAgenda
            days={week.days}
            weekStart={week.weekStart}
            weekEnd={week.weekEnd}
            onPreviousWeek={() => setReferenceDate((date) => subDays(date, 7))}
            onNextWeek={() => setReferenceDate((date) => addDays(date, 7))}
            onCurrentWeek={() => setReferenceDate(new Date())}
            onResumeWorkout={(sessionId) => navigate(`/sessao/${sessionId}`)}
            startingScheduleId={startingScheduleId}
            onStartWorkout={handleStartSchedule}
          />
        )
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="size-4 text-primary" />
              Meta semanal
            </div>
            <span className="text-sm text-muted-foreground">
              {completedWorkouts}/{weeklyGoal} treinos
            </span>
          </div>
          <div
            className="grid grid-cols-3 gap-2"
            aria-label={`${completedWorkouts} de ${weeklyGoal} treinos concluídos`}
          >
            {Array.from({ length: weeklyGoal }, (_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 rounded-full bg-muted',
                  index < completedWorkouts && 'bg-primary'
                )}
              />
            ))}
          </div>
          {completedWorkouts >= weeklyGoal && (
            <p className="text-xs font-medium text-primary">Meta da semana atingida!</p>
          )}
        </CardContent>
      </Card>

      {!activeSession && (
        <Button variant="outline" onClick={handleOpenPlanPicker}>
          Escolher outro treino
        </Button>
      )}

      <Sheet open={pickPlanOpen} onOpenChange={setPickPlanOpen}>
        <SheetContent
          side="bottom"
          className="mobile-drawer-safe-area max-h-screen overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Escolher treino</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2 pb-4">
            {plansQuery.isFetching && <Skeleton className="h-16 rounded-lg" />}
            {!plansQuery.isFetching && plans.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Info className="size-8" strokeWidth={1} />
                <p className="text-sm">Nenhuma ficha disponível</p>
              </div>
            )}
            {plans.map((plan) => (
              <Button
                key={plan.id}
                variant="outline"
                className="h-auto justify-start gap-3 p-3 text-left"
                onClick={() => handleStartFromPlan(plan)}
                disabled={startSessionMutation.isPending}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="size-4 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{plan.name}</span>
                  {plan.objective && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {plan.objective}
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-warning-emphasis" />
        <p className="text-xs text-status-warning-emphasis">
          Se estiver se sentindo cansado, converse com seu personal sobre uma semana de deload.
        </p>
      </div>
    </main>
  )
}
