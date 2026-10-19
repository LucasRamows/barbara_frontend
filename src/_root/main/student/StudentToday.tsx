import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Dumbbell, Play, RotateCcw, AlertTriangle, Target, Info } from 'lucide-react'
import { useSession } from '@/contexts/SessionContext'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import { workoutSchedulesService } from '@/services/workout-schedules/workout-schedules.service'
import { workoutPlansService } from '@/services/workout-plans/workout-plans.service'
import type { WorkoutSession, SessionSummary } from '@/types/session.types'
import type { WorkoutSchedule, WorkoutPlan, DayOfWeek } from '@/types/workout-plan.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const JS_DAY_TO_DOW: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

function getWeekStart(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

export default function StudentToday() {
  const { user } = useSession()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<WorkoutSchedule | null>(null)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [startingSession, setStartingSession] = useState(false)
  const [pickPlanOpen, setPickPlanOpen] = useState(false)
  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const todayDow = JS_DAY_TO_DOW[new Date().getDay()]

  const load = useCallback(async () => {
    try {
      const [active, schedules, recentSessions] = await Promise.all([
        workoutSessionsService.getActive(),
        workoutSchedulesService.listForStudent(undefined as unknown as string),
        workoutSessionsService.getAll({ limit: 7 }),
      ])

      setActiveSession(active)

      const found = schedules.find(
        (s: WorkoutSchedule) => s.dayOfWeek === todayDow && s.isActive,
      ) ?? null
      setTodaySchedule(found)

      const weekStart = getWeekStart(new Date())
      const count = (recentSessions.data as SessionSummary[]).filter((s) => {
        const d = new Date(s.startedAt)
        return d >= weekStart && (s.status === 'COMPLETED' || s.status === 'PARTIAL')
      }).length
      setWeeklyCount(count)
    } catch {
      // silently fail — page still renders
    } finally {
      setLoading(false)
    }
  }, [todayDow])

  useEffect(() => {
    load()
  }, [load])

  const handleStartSession = async (schedule: WorkoutSchedule) => {
    const plan = await workoutPlansService.get(schedule.workoutPlanId).catch(() => null)
    if (!plan || !plan.days?.length) {
      toast.error('Ficha sem dias de treino configurados')
      return
    }
    const day = plan.days[0]
    setStartingSession(true)
    try {
      const session = await workoutSessionsService.start({
        workoutPlanId: plan.id,
        workoutPlanDayId: day.id,
        scheduledPlanId: schedule.id,
      })
      navigate(`/sessao/${session.id}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message || 'Erro ao iniciar treino')
    } finally {
      setStartingSession(false)
    }
  }

  const handlePickPlan = async () => {
    setPickPlanOpen(true)
    if (!allPlans.length) {
      try {
        const plans = await workoutPlansService.list()
        setAllPlans(plans.filter((p: WorkoutPlan) => p.isActive))
      } catch {
        toast.error('Erro ao carregar fichas')
      }
    }
  }

  const handleStartFromPlan = async (plan: WorkoutPlan) => {
    if (!plan.days?.length) {
      toast.error('Ficha sem dias configurados')
      return
    }
    setStartingSession(true)
    setPickPlanOpen(false)
    try {
      const session = await workoutSessionsService.start({
        workoutPlanId: plan.id,
        workoutPlanDayId: plan.days[0].id,
      })
      navigate(`/sessao/${session.id}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message || 'Erro ao iniciar treino')
    } finally {
      setStartingSession(false)
    }
  }

  const weeklyGoal = 3

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Active session resume card */}
      {activeSession && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/15">
              <RotateCcw size={18} className="text-primary" />
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

      {/* Today's workout */}
      {todaySchedule && !activeSession && (
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Treino de hoje</p>
                  <p className="mt-0.5 font-display text-lg font-bold text-foreground leading-tight">
                    {todaySchedule.workoutPlan.name}
                  </p>
                  {todaySchedule.workoutPlan.objective && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {todaySchedule.workoutPlan.objective}
                    </p>
                  )}
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Dumbbell size={20} className="text-primary" />
                </div>
              </div>

              <Button
                className="mt-1 w-full gap-2"
                size="lg"
                onClick={() => handleStartSession(todaySchedule)}
                disabled={startingSession}
              >
                <Play size={16} className="fill-current" />
                {startingSession ? 'Iniciando...' : 'Iniciar treino'}
              </Button>
            </CardContent>
          </Card>

          {/* Weekly goal progress */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Target size={14} className="text-primary" />
                Meta semanal
              </div>
              <span className="text-sm text-muted-foreground">
                {weeklyCount}/{weeklyGoal} treinos
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (weeklyCount / weeklyGoal) * 100)}%` }}
              />
            </div>
            {weeklyCount >= weeklyGoal && (
              <p className="text-xs text-primary font-medium">Meta da semana atingida!</p>
            )}
          </div>
        </div>
      )}

      {/* No workout today */}
      {!todaySchedule && !activeSession && (
        <div className="flex flex-col gap-3">
          <EmptyState
            icon={<Dumbbell size={48} strokeWidth={1} />}
            title="Sem treino programado"
            description="Nenhum treino programado para hoje. Quer treinar mesmo assim?"
            action={
              <Button variant="outline" size="sm" onClick={handlePickPlan}>
                Escolher outro treino
              </Button>
            }
          />
        </div>
      )}

      {/* Pick plan sheet (for free choice) */}
      <Sheet open={pickPlanOpen} onOpenChange={setPickPlanOpen}>
        <SheetContent side="bottom" className="mobile-drawer-safe-area max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Escolher treino</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2 pb-4">
            {!allPlans.length && (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Info size={32} strokeWidth={1} />
                <p className="text-sm">Nenhuma ficha disponível</p>
              </div>
            )}
            {allPlans.map((plan) => (
              <button
                key={plan.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                onClick={() => handleStartFromPlan(plan)}
                disabled={startingSession}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{plan.name}</p>
                  {plan.objective && (
                    <p className="truncate text-xs text-muted-foreground">{plan.objective}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Deload banner */}
      {todaySchedule && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-status-warning-emphasis" />
          <p className="text-xs text-status-warning-emphasis">
            <strong>Dica:</strong> Se estiver se sentindo cansado, converse com seu personal sobre uma semana de deload.
          </p>
        </div>
      )}
    </div>
  )
}
