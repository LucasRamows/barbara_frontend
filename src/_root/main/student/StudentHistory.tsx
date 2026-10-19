import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  format,
  getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import type { SessionSummary, SessionStatus } from '@/types/session.types'
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

function groupByMonth(sessions: SessionSummary[]) {
  const groups = new Map<string, SessionSummary[]>()
  for (const s of sessions) {
    const key = format(new Date(s.startedAt), 'MMMM yyyy', { locale: ptBR })
    const cap = key.charAt(0).toUpperCase() + key.slice(1)
    if (!groups.has(cap)) groups.set(cap, [])
    groups.get(cap)!.push(s)
  }
  return groups
}

export default function StudentHistory() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const LIMIT = 20

  useEffect(() => {
    workoutSessionsService
      .getAll({ limit: 50 })
      .then((res) => {
        setSessions(res.data)
        setTotal(res.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadMore = async () => {
    const nextPage = page + 1
    const res = await workoutSessionsService.getAll({ page: nextPage, limit: LIMIT }).catch(() => null)
    if (res) {
      setSessions((prev) => [...prev, ...res.data])
      setPage(nextPage)
    }
  }

  // Calendar
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7 // Monday=0

  const sessionsByDay = sessions.reduce<Record<string, SessionStatus[]>>((acc, s) => {
    const key = format(new Date(s.startedAt), 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(s.status)
    return acc
  }, {})

  const groups = groupByMonth(sessions)

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Histórico</h1>

      {/* Mini calendar */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-foreground capitalize">
            {format(calendarMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
          <button
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <span key={i} className="text-xs text-muted-foreground py-1">{d}</span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const statuses = sessionsByDay[key] ?? []
            const isToday = isSameDay(day, new Date())
            const hasCompleted = statuses.includes('COMPLETED')
            const hasPartial = statuses.includes('PARTIAL')

            return (
              <div key={key} className="flex flex-col items-center py-1">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs',
                    isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {(hasCompleted || hasPartial) && (
                  <span
                    className={cn(
                      'mt-0.5 size-1.5 rounded-full',
                      hasCompleted ? 'bg-success' : 'bg-status-warning',
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma sessão registrada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(groups.entries()).map(([monthLabel, monthSessions]) => (
            <div key={monthLabel}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {monthLabel}
              </p>
              <div className="flex flex-col gap-2">
                {monthSessions.map((s) => (
                  <button
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                    onClick={() => navigate(`/historico/${s.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground capitalize">
                        {format(new Date(s.startedAt), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.planSnapshot?.planName ?? 'Treino livre'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS_BADGE[s.status],
                        )}
                      >
                        {STATUS_LABELS[s.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.durationSeconds ? formatDuration(s.durationSeconds) : '—'}
                      </span>
                      {s.isDeload && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Deload
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {sessions.length < total && (
            <Button variant="outline" className="w-full" onClick={loadMore}>
              Carregar mais
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
