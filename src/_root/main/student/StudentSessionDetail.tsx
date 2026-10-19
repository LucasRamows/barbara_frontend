import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Check, X } from 'lucide-react'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import type { WorkoutSession, SessionStatus } from '@/types/session.types'
import { formatDuration } from '@/lib/formatDuration'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<SessionStatus, string> = {
  COMPLETED: 'Completo',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
  IN_PROGRESS: 'Em andamento',
}

const STATUS_BADGE: Record<SessionStatus, string> = {
  COMPLETED: 'bg-success/15 text-success',
  PARTIAL: 'bg-warning/15 text-status-warning-emphasis',
  CANCELLED: 'bg-destructive/15 text-destructive',
  IN_PROGRESS: 'bg-primary/10 text-primary',
}

export default function StudentSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    workoutSessionsService
      .getOne(sessionId)
      .then(setSession)
      .catch(() => navigate('/historico', { replace: true }))
      .finally(() => setLoading(false))
  }, [sessionId, navigate])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!session) return null

  const exercises = session.exercises.slice().sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/historico')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-foreground capitalize">
            {format(new Date(session.startedAt), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h1>
        </div>
      </div>

      {/* Summary card */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              STATUS_BADGE[session.status],
            )}
          >
            {STATUS_LABELS[session.status]}
          </span>
          {session.isDeload && (
            <Badge variant="outline" className="text-xs">
              Deload
            </Badge>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground">
          {session.planSnapshot?.planName ?? 'Treino livre'}
        </p>
        <p className="text-xs text-muted-foreground">
          Duração: {session.durationSeconds ? formatDuration(session.durationSeconds) : '—'}
        </p>
        {session.partialReason && (
          <p className="text-xs text-status-warning-emphasis">
            Motivo: {session.partialReason}
          </p>
        )}
      </div>

      {/* Exercises */}
      {exercises.map((ex) => {
        const snap = ex.exerciseSnapshot
        return (
          <div key={ex.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <p className="flex-1 font-semibold text-foreground text-sm">{snap.name}</p>
              {ex.isCompleted && <Check size={14} className="text-success" />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-muted-foreground font-medium w-10">#</th>
                    <th className="px-4 py-2 text-left text-muted-foreground font-medium">Peso</th>
                    <th className="px-4 py-2 text-left text-muted-foreground font-medium">Reps</th>
                    <th className="px-4 py-2 text-left text-muted-foreground font-medium">RPE</th>
                    <th className="px-4 py-2 text-center text-muted-foreground font-medium w-8">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 text-muted-foreground">{s.setNumber}</td>
                      <td className="px-4 py-2 text-foreground">
                        {s.usedWeight != null ? `${s.usedWeight} ${s.weightUnit.toLowerCase()}` : '—'}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {s.completedReps != null ? s.completedReps : '—'}
                      </td>
                      <td className="px-4 py-2 text-foreground">{s.rpe ?? '—'}</td>
                      <td className="px-4 py-2 text-center">
                        {s.isCompleted ? (
                          <Check size={12} className="mx-auto text-success" />
                        ) : (
                          <X size={12} className="mx-auto text-muted-foreground/50" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
