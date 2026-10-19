import { useEffect, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { studentsService } from '@/services/students/students.service'
import { workoutSessionsService } from '@/services/workout-sessions/workout-sessions.service'
import { loadProgressionService } from '@/services/load-progression/load-progression.service'
import type { SessionSummary } from '@/types/session.types'
import { formatRelativeDate } from '@/lib/formatDuration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SESSION_STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-success/15 text-success',
  PARTIAL: 'bg-warning/15 text-status-warning-emphasis',
  CANCELLED: 'bg-destructive/15 text-destructive',
  IN_PROGRESS: 'bg-primary/10 text-primary',
}

const SESSION_STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completo',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
  IN_PROGRESS: 'Em andamento',
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

export default function PersonalDashboard() {
  const { user } = useSession()
  const [activeStudents, setActiveStudents] = useState<number | null>(null)
  const [trainedToday, setTrainedToday] = useState<number | null>(null)
  const [pendingSuggestions, setPendingSuggestions] = useState<number | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([])

  useEffect(() => {
    const today = new Date()

    Promise.allSettled([
      studentsService.list().then((students) => {
        setActiveStudents(students.filter((s: { user: { status: string } }) => s.user.status === 'ACTIVE').length)
      }),
      workoutSessionsService.getAll({ limit: 20 }).then((res) => {
        const todayCount = res.data.filter((s: SessionSummary) => {
          return isSameDay(new Date(s.startedAt), today)
        }).length
        setTrainedToday(todayCount)
        setRecentSessions(res.data.slice(0, 5))
      }),
      loadProgressionService.getSuggestions().then((res) => {
        const list = res?.data ?? []
        setPendingSuggestions(list.filter((s: { isAccepted: boolean | null }) => s.isAccepted === null).length)
      }),
    ])
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe seus alunos e treinos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Alunos ativos" value={activeStudents} />
        <StatCard title="Treinaram hoje" value={trainedToday} />
        <StatCard title="Sugestões pendentes" value={pendingSuggestions} />
      </div>

      {recentSessions.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Atividade recente</p>
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.planSnapshot?.planName ?? 'Treino livre'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(s.startedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                    SESSION_STATUS_BADGE[s.status] ?? 'bg-muted text-muted-foreground',
                  )}
                >
                  {SESSION_STATUS_LABELS[s.status] ?? s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | null }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="font-display text-3xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
