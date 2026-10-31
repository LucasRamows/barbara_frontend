import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Plus, SkipForward, Timer } from 'lucide-react'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import { workoutSetsService } from '@/services/workout-sets/workout-sets.service'
import type { WorkoutSession, SessionExercise, WorkoutSetData } from '@/types/session.types'
import type { MuscleGroup } from '@/types/exercise.types'
import { MuscleGroupBadge } from '@/components/shared/MuscleGroupBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Session timer ─── */
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

/* ─── Rest timer overlay (portal over layout) ─── */
function RestTimer({ seconds, onSkip }: { seconds: number; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const pct = Math.max(0, (remaining / seconds) * 100)
  const circ = 2 * Math.PI * 40

  useEffect(() => {
    if (remaining <= 0) { onSkip(); return }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, onSkip])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/96 backdrop-blur-sm animate-in fade-in duration-150 px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Descanse</p>
      <div className="relative flex size-36 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90 size-36" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="5" className="stroke-muted" />
          <circle
            cx="50" cy="50" r="40" fill="none" strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round" className="stroke-primary transition-all duration-1000"
          />
        </svg>
        <span className="font-display text-4xl font-bold tabular-nums text-foreground">{remaining}</span>
      </div>
      <p className="text-sm text-muted-foreground">Série concluída! Próxima em breve.</p>
      <Button variant="outline" className="gap-2" onClick={onSkip}>
        <SkipForward size={14} />
        Pular descanso
      </Button>
    </div>
  )
}

/* ─── Stepper (single row, full width) ─── */
function Stepper({
  label, hint, value, step = 1, min = 0, decimals, onChange, disabled,
}: {
  label: string; hint?: string; value: number; step?: number; min?: number
  decimals?: boolean; onChange: (v: number) => void; disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Diminuir ${label}`}
          disabled={disabled}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold text-foreground transition-colors active:scale-95 disabled:opacity-40"
        >−</button>
        <input
          type="number"
          inputMode={decimals ? 'decimal' : 'numeric'}
          step={step}
          disabled={disabled}
          value={decimals ? value : Math.round(value)}
          onChange={(e) => {
            const raw = decimals ? parseFloat(e.target.value) : parseInt(e.target.value)
            if (!isNaN(raw)) onChange(Math.max(min, raw))
          }}
          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background text-center text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40"
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          disabled={disabled}
          onClick={() => onChange(value + step)}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold text-foreground transition-colors active:scale-95 disabled:opacity-40"
        >+</button>
      </div>
    </div>
  )
}

/* ─── Active set card ─── */
function ActiveSetCard({
  set, onUpdate, onComplete,
}: { set: WorkoutSetData; onUpdate: (id: string, u: Partial<WorkoutSetData>) => void; onComplete: (id: string) => void }) {
  const [showRpe, setShowRpe] = useState(false)
  const wRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debounce = (ref: typeof wRef, fn: () => void) => {
    if (ref.current) clearTimeout(ref.current)
    ref.current = setTimeout(fn, 500)
  }

  const setWeight = (v: number) => {
    onUpdate(set.id, { usedWeight: v })
    debounce(wRef, () => workoutSetsService.update(set.id, { usedWeight: v }).catch(() => {}))
  }

  const setReps = (v: number) => {
    onUpdate(set.id, { completedReps: v })
    debounce(rRef, () => workoutSetsService.update(set.id, { completedReps: v }).catch(() => {}))
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/25 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {set.setNumber}
          </span>
          <span className="text-sm font-semibold text-foreground">Série ativa</span>
        </div>
        {set.plannedReps != null && (
          <span className="text-xs text-muted-foreground">Meta: {set.plannedReps} reps</span>
        )}
      </div>

      <Stepper
        label={`Carga (${set.weightUnit === 'KG' ? 'kg' : 'lb'})`}
        value={set.usedWeight ?? set.plannedWeight ?? 0}
        step={2.5} min={0} decimals
        onChange={setWeight}
      />

      <Stepper
        label="Repetições"
        hint={set.plannedReps ? `Planejado: ${set.plannedReps}` : undefined}
        value={set.completedReps ?? set.plannedReps ?? 0}
        step={1} min={0}
        onChange={setReps}
      />

      {/* RPE — optional, collapsed */}
      <div>
        <button
          type="button"
          onClick={() => setShowRpe((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          {showRpe ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          RPE
          {set.rpe != null && <span className="ml-1 font-semibold text-foreground">{set.rpe}/10</span>}
        </button>
        {showRpe && (
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  onUpdate(set.id, { rpe: n })
                  workoutSetsService.update(set.id, { rpe: n }).catch(() => {})
                }}
                className={cn(
                  'flex-1 rounded-lg py-2 text-[11px] font-bold transition-colors',
                  set.rpe === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >{n}</button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onComplete(set.id)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-opacity active:opacity-75"
      >
        <Check size={15} strokeWidth={2.5} />
        Concluir série
      </button>
    </div>
  )
}

/* ─── Completed set row ─── */
function CompletedRow({ set }: { set: WorkoutSetData }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success/8 px-3 py-2.5">
      <Check size={13} className="shrink-0 text-success" strokeWidth={3} />
      <span className="text-sm text-muted-foreground">Série {set.setNumber}</span>
      <div className="ml-auto flex items-center gap-3 text-sm font-semibold text-foreground">
        {set.usedWeight != null && <span>{set.usedWeight} kg</span>}
        {set.completedReps != null && <span>× {set.completedReps}</span>}
        {set.rpe != null && <span className="text-xs font-normal text-muted-foreground">RPE {set.rpe}</span>}
      </div>
    </div>
  )
}

/* ─── Page ─── */
export default function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [exIdx, setExIdx] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [partialOpen, setPartialOpen] = useState(false)
  const [backOpen, setBackOpen] = useState(false)
  const [resting, setResting] = useState(false)

  const timer = useTimer(session?.startedAt ?? new Date().toISOString())

  useEffect(() => {
    if (!sessionId) return
    workoutSessionsService.getOne(sessionId)
      .then((s) => {
        if (s.status !== 'IN_PROGRESS') { navigate('/historico', { replace: true }); return }
        setSession(s)
      })
      .catch(() => { toast.error('Sessão não encontrada'); navigate('/', { replace: true }) })
      .finally(() => setLoading(false))
  }, [sessionId, navigate])

  const exercises = (session?.exercises ?? []).slice().sort((a, b) => a.order - b.order)
  const ex: SessionExercise | undefined = exercises[exIdx]
  const isLast = exIdx === exercises.length - 1
  const snap = ex?.exerciseSnapshot

  const sets = ex?.sets ?? []
  const doneSets = sets.filter((s) => s.isCompleted)
  const activeSet = sets.find((s) => !s.isCompleted)
  const allDone = sets.length > 0 && sets.every((s) => s.isCompleted)

  const updateSet = useCallback((id: string, u: Partial<WorkoutSetData>) => {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((e) => ({
          ...e, sets: e.sets.map((s) => s.id === id ? { ...s, ...u } : s),
        })),
      }
    })
  }, [])

  const completeSet = useCallback(async (id: string) => {
    if (!ex) return
    const s = ex.sets.find((s) => s.id === id)
    if (!s) return
    updateSet(id, { isCompleted: true, completedAt: new Date().toISOString() })
    try {
      await workoutSetsService.update(id, {
        isCompleted: true,
        completedReps: s.completedReps ?? s.plannedReps,
        usedWeight: s.usedWeight ?? s.plannedWeight ?? undefined,
        rpe: s.rpe ?? undefined,
      })
      const moreSets = ex.sets.filter((s2) => s2.id !== id && !s2.isCompleted)
      if (moreSets.length > 0 && snap?.restSeconds) setResting(true)
    } catch {
      updateSet(id, { isCompleted: false, completedAt: null })
      toast.error('Erro ao salvar série')
    }
  }, [ex, updateSet, snap])

  const addExtra = useCallback(async () => {
    if (!ex) return
    try {
      const s = await workoutSetsService.addExtra(ex.id)
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: prev.exercises.map((e) =>
            e.id === ex.id ? { ...e, sets: [...e.sets, s] } : e,
          ),
        }
      })
    } catch { toast.error('Erro ao adicionar série extra') }
  }, [ex])

  const finish = async (partial = false, reason?: string) => {
    if (!sessionId) return
    setFinishing(true)
    try {
      await workoutSessionsService.finish(sessionId, { isPartial: partial, partialReason: reason })
      toast.success(partial ? 'Treino encerrado parcialmente' : 'Treino concluído! 🎉')
      navigate('/historico', { replace: true })
    } catch { toast.error('Erro ao encerrar treino') }
    finally { setFinishing(false) }
  }

  const goNext = () => {
    if (!isLast) {
      setExIdx((i) => i + 1)
      setShowInstructions(false)
      setResting(false)
    } else {
      const everythingDone = exercises.every((e) => e.sets.every((s) => s.isCompleted))
      if (everythingDone) finish(false)
      else setPartialOpen(true)
    }
  }

  if (loading || !session || !ex || !snap) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {/* Rest timer: full-screen overlay, z-50 floats over everything */}
      {resting && snap.restSeconds > 0 && (
        <RestTimer seconds={snap.restSeconds} onSkip={() => setResting(false)} />
      )}

      <div className="flex flex-col gap-0">
        {/* ── Session bar ── */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
          <button
            aria-label="Sair do treino"
            onClick={() => setBackOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {session.planSnapshot?.planName}
            </p>
            <p className="text-xs text-muted-foreground">
              Exercício {exIdx + 1} / {exercises.length}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-primary">
            <Timer size={12} />
            <span className="font-mono text-xs font-bold tabular-nums">{timer}</span>
          </div>
        </div>

        {/* ── Exercise dots strip ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-4 py-2 scrollbar-hide">
          {exercises.map((e, i) => {
            const done = e.sets.length > 0 && e.sets.every((s) => s.isCompleted)
            const active = i === exIdx
            return (
              <div
                key={e.id}
                className={cn(
                  'flex shrink-0 size-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                  active ? 'bg-primary text-primary-foreground' :
                  done ? 'bg-success/20 text-success' :
                  'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check size={10} strokeWidth={3} /> : i + 1}
              </div>
            )
          })}
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col gap-4 p-4">
          {/* Deload */}
          {session.isDeload && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2">
              <p className="text-xs font-medium text-status-warning-emphasis">
                Semana de deload — cargas reduzidas
              </p>
            </div>
          )}

          {/* Exercise identity — shown only once */}
          <div className="flex flex-col gap-1.5">
            <MuscleGroupBadge group={snap.muscleGroup as MuscleGroup} />
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">{snap.name}</h1>
            {snap.imageUrl && (
              <img src={snap.imageUrl} alt={snap.name} className="mt-1 h-40 w-full rounded-2xl object-cover" />
            )}
            {snap.instructions && (
              <div>
                <button
                  onClick={() => setShowInstructions((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-primary"
                >
                  {showInstructions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showInstructions ? 'Ocultar instruções' : 'Ver instruções'}
                </button>
                {showInstructions && (
                  <p className="mt-1.5 rounded-xl bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                    {snap.instructions}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Set progress pips + rest info */}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-1">
              {sets.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    s.isCompleted ? 'bg-success' :
                    s.id === activeSet?.id ? 'bg-primary' :
                    'bg-muted',
                  )}
                />
              ))}
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              {doneSets.length}/{sets.length}
            </p>
            {snap.restSeconds > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Timer size={11} />
                {snap.restSeconds}s
              </div>
            )}
          </div>

          {/* Completed sets */}
          {doneSets.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {doneSets.map((s) => <CompletedRow key={s.id} set={s} />)}
            </div>
          )}

          {/* Active set OR all-done state */}
          {allDone ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/8 py-6 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-success/20">
                <Check size={22} className="text-success" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Exercício concluído</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sets.length} séries completadas</p>
              </div>
              <Button className="w-full mt-1" onClick={goNext} disabled={finishing}>
                {isLast ? 'Concluir treino' : 'Próximo exercício →'}
              </Button>
            </div>
          ) : activeSet ? (
            <ActiveSetCard set={activeSet} onUpdate={updateSet} onComplete={completeSet} />
          ) : null}

          {/* Extra set */}
          {!allDone && (
            <button
              type="button"
              onClick={addExtra}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus size={13} />
              Adicionar série extra
            </button>
          )}

          {/* Navigation — inline, not fixed */}
          {!allDone && (
            <div className="flex gap-2 pt-1">
              {exIdx > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={() => { setExIdx((i) => i - 1); setShowInstructions(false) }}
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Anterior
                </Button>
              )}
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground"
                size="sm"
                onClick={goNext}
                disabled={finishing}
              >
                {isLast ? 'Encerrar' : 'Pular exercício'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={backOpen} onOpenChange={setBackOpen}
        trigger={<span />}
        title="Sair do treino"
        description="Seu progresso está salvo. Pode retomar a qualquer momento."
        confirmLabel="Sair"
        cancelLabel="Continuar treinando"
        onConfirm={() => navigate('/')}
      />

      <ConfirmDialog
        open={partialOpen} onOpenChange={setPartialOpen}
        trigger={<span />}
        title="Encerrar parcialmente"
        description="Algumas séries não foram concluídas. Deseja encerrar mesmo assim?"
        confirmLabel="Encerrar parcialmente"
        cancelLabel="Continuar"
        onConfirm={() => finish(true, 'Encerrado antecipadamente')}
        destructive
      />
    </>
  )
}
