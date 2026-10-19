import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import { workoutSetsService } from '@/services/workout-sets/workout-sets.service'
import type { WorkoutSession, SessionExercise, WorkoutSetData } from '@/types/session.types'
import type { MuscleGroup } from '@/types/exercise.types'
import { MuscleGroupBadge } from '@/components/shared/MuscleGroupBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useTimer(startedAt: string) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const base = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    setElapsed(base)
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface SetRowProps {
  set: WorkoutSetData
  onUpdate: (id: string, updates: Partial<WorkoutSetData>) => void
  onComplete: (id: string) => void
}

function SetRow({ set, onUpdate, onComplete }: SetRowProps) {
  const weightRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repsRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debounce = (
    ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    fn: () => void,
    delay = 500,
  ) => {
    if (ref.current) clearTimeout(ref.current)
    ref.current = setTimeout(fn, delay)
  }

  const handleWeightChange = (val: number) => {
    const clamped = Math.max(0, val)
    onUpdate(set.id, { usedWeight: clamped })
    debounce(weightRef, () => {
      workoutSetsService.update(set.id, { usedWeight: clamped }).catch(() => {})
    })
  }

  const handleRepsChange = (val: number) => {
    const clamped = Math.max(0, Math.round(val))
    onUpdate(set.id, { completedReps: clamped })
    debounce(repsRef, () => {
      workoutSetsService.update(set.id, { completedReps: clamped }).catch(() => {})
    })
  }

  const handleRpeSelect = (rpe: number) => {
    onUpdate(set.id, { rpe })
    workoutSetsService.update(set.id, { rpe }).catch(() => {})
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-colors',
        set.isCompleted
          ? 'border-success/30 bg-success/10'
          : 'border-border bg-card',
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {set.setNumber}
        </span>
        {set.isCompleted && <Check size={14} className="text-success" />}
      </div>

      {/* Weight + Reps row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Peso ({set.weightUnit === 'KG' ? 'kg' : 'lb'})
          </p>
          <div className="flex items-center gap-1">
            <button
              className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground text-xl font-bold active:bg-muted/70"
              onClick={() => handleWeightChange((set.usedWeight ?? 0) - 2.5)}
              disabled={set.isCompleted}
            >
              −
            </button>
            <input
              type="number"
              inputMode="decimal"
              className="h-11 flex-1 rounded-lg border border-border bg-background text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              value={set.usedWeight ?? ''}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
              disabled={set.isCompleted}
            />
            <button
              className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground text-xl font-bold active:bg-muted/70"
              onClick={() => handleWeightChange((set.usedWeight ?? 0) + 2.5)}
              disabled={set.isCompleted}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Reps ({set.plannedReps})
          </p>
          <div className="flex items-center gap-1">
            <button
              className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground text-xl font-bold active:bg-muted/70"
              onClick={() => handleRepsChange((set.completedReps ?? set.plannedReps) - 1)}
              disabled={set.isCompleted}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              className="h-11 flex-1 rounded-lg border border-border bg-background text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              value={set.completedReps ?? ''}
              onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
              disabled={set.isCompleted}
            />
            <button
              className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground text-xl font-bold active:bg-muted/70"
              onClick={() => handleRepsChange((set.completedReps ?? set.plannedReps) + 1)}
              disabled={set.isCompleted}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* RPE row */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs text-muted-foreground">RPE</p>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={cn(
                'flex-1 rounded-md py-2 text-xs font-semibold transition-colors',
                set.rpe === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
              onClick={() => handleRpeSelect(n)}
              disabled={set.isCompleted}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Complete button */}
      {!set.isCompleted && (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80"
          onClick={() => onComplete(set.id)}
        >
          <Check size={16} />
          Concluir série
        </button>
      )}
    </div>
  )
}

export default function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [finishLoading, setFinishLoading] = useState(false)
  const [partialOpen, setPartialOpen] = useState(false)
  const [backDialogOpen, setBackDialogOpen] = useState(false)

  const timer = useTimer(session?.startedAt ?? new Date().toISOString())

  useEffect(() => {
    if (!sessionId) return
    workoutSessionsService
      .getOne(sessionId)
      .then((s) => {
        if (s.status !== 'IN_PROGRESS') {
          navigate('/historico', { replace: true })
          return
        }
        setSession(s)
      })
      .catch(() => {
        toast.error('Sessão não encontrada')
        navigate('/', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [sessionId, navigate])

  const exercises = (session?.exercises ?? []).slice().sort((a, b) => a.order - b.order)
  const currentExercise: SessionExercise | undefined = exercises[exerciseIndex]
  const isLast = exerciseIndex === exercises.length - 1

  const updateSet = useCallback(
    (setId: string, updates: Partial<WorkoutSetData>) => {
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          })),
        }
      })
    },
    [],
  )

  const completeSet = useCallback(
    async (setId: string) => {
      if (!currentExercise) return
      const set = currentExercise.sets.find((s) => s.id === setId)
      if (!set) return

      updateSet(setId, { isCompleted: true, completedAt: new Date().toISOString() })

      try {
        await workoutSetsService.update(setId, {
          isCompleted: true,
          completedReps: set.completedReps ?? set.plannedReps,
          usedWeight: set.usedWeight ?? set.plannedWeight ?? undefined,
          rpe: set.rpe ?? undefined,
        })
      } catch {
        updateSet(setId, { isCompleted: false, completedAt: null })
        toast.error('Erro ao salvar série')
      }
    },
    [currentExercise, updateSet],
  )

  const addExtraSet = useCallback(async () => {
    if (!currentExercise) return
    try {
      const newSet = await workoutSetsService.addExtra(currentExercise.id)
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: prev.exercises.map((ex) =>
            ex.id === currentExercise.id ? { ...ex, sets: [...ex.sets, newSet] } : ex,
          ),
        }
      })
    } catch {
      toast.error('Erro ao adicionar série extra')
    }
  }, [currentExercise])

  const handleFinish = async (isPartial = false, reason?: string) => {
    if (!sessionId) return
    setFinishLoading(true)
    try {
      await workoutSessionsService.finish(sessionId, {
        isPartial,
        partialReason: reason,
      })
      toast.success(isPartial ? 'Treino encerrado parcialmente' : 'Treino concluído!')
      navigate('/historico', { replace: true })
    } catch {
      toast.error('Erro ao encerrar treino')
    } finally {
      setFinishLoading(false)
    }
  }

  const handleNext = () => {
    if (!isLast) {
      setExerciseIndex((i) => i + 1)
      setShowInstructions(false)
    } else {
      const allDone = exercises.every((ex) => ex.sets.every((s) => s.isCompleted))
      if (allDone) {
        handleFinish(false)
      } else {
        setPartialOpen(true)
      }
    }
  }

  if (loading || !session || !currentExercise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const snap = currentExercise.exerciseSnapshot

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="mobile-header-safe-area flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          onClick={() => setBackDialogOpen(true)}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-foreground">
            Exercício {exerciseIndex + 1}/{exercises.length}
          </p>
          <p className="text-xs text-muted-foreground">{session.planSnapshot?.planName}</p>
        </div>
        <div className="min-w-[64px] text-right">
          <span className="font-mono text-sm font-semibold text-primary">{timer}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col gap-4 p-4">
          {/* Deload banner */}
          {session.isDeload && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2">
              <p className="text-xs font-medium text-status-warning-emphasis">
                Semana de deload — cargas reduzidas
              </p>
            </div>
          )}

          {/* Exercise header */}
          <div className="flex flex-col gap-2">
            <MuscleGroupBadge group={snap.muscleGroup as MuscleGroup} />
            <h1 className="font-display text-2xl font-bold text-foreground">{snap.name}</h1>

            {snap.imageUrl && (
              <img
                src={snap.imageUrl}
                alt={snap.name}
                className="h-48 w-full rounded-xl object-cover"
              />
            )}

            {snap.instructions && (
              <button
                className="flex items-center gap-1 text-xs text-primary"
                onClick={() => setShowInstructions((v) => !v)}
              >
                {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showInstructions ? 'Ocultar instruções' : 'Ver instruções'}
              </button>
            )}
            {showInstructions && snap.instructions && (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {snap.instructions}
              </p>
            )}
          </div>

          {/* Sets */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">Séries</p>
            {currentExercise.sets.map((set) => (
              <SetRow key={set.id} set={set} onUpdate={updateSet} onComplete={completeSet} />
            ))}
            <button
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              onClick={addExtraSet}
            >
              <Plus size={14} />
              Adicionar série extra
            </button>
          </div>

          {/* Reference: rest seconds */}
          {snap.restSeconds > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Descanso recomendado:{' '}
                <strong className="text-foreground">{snap.restSeconds}s</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mobile-bottom-safe-area fixed inset-x-0 bottom-0 flex gap-3 border-t border-border bg-card px-4 py-3">
        {exerciseIndex > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { setExerciseIndex((i) => i - 1); setShowInstructions(false) }}
          >
            <ArrowLeft size={16} />
            Anterior
          </Button>
        )}
        <Button
          className="flex-1 gap-2"
          onClick={handleNext}
          disabled={finishLoading}
        >
          {isLast ? 'Concluir treino' : (
            <>
              Próximo
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>

      {/* Back dialog */}
      <ConfirmDialog
        open={backDialogOpen}
        onOpenChange={setBackDialogOpen}
        trigger={<span />}
        title="Sair do treino"
        description="Seu treino está salvo. Você pode retomá-lo a qualquer momento."
        confirmLabel="Sair"
        cancelLabel="Continuar treinando"
        onConfirm={() => navigate('/')}
      />

      {/* Partial finish dialog */}
      <ConfirmDialog
        open={partialOpen}
        onOpenChange={setPartialOpen}
        trigger={<span />}
        title="Encerrar treino parcialmente"
        description="Algumas séries ainda não foram concluídas. Deseja encerrar mesmo assim?"
        confirmLabel="Encerrar parcialmente"
        cancelLabel="Continuar"
        onConfirm={() => handleFinish(true, 'Encerrado antecipadamente')}
        destructive
      />
    </div>
  )
}
