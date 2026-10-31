import { CalendarX, Clock, Dumbbell, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDuration } from '@/lib/formatDuration'
import { useStudentWorkoutHistory } from '../hooks/use-student-workout-history'
import type { SessionStatus, SessionSummary } from '@/types/session.types'
import { ExpandedTableRow } from '@/components/common/ExpandedTableRow'
import { TabNavigation } from '@/components/common/TabNavigation'
import { HistoryCalendar } from '@/components/common/HistoryCalendar'
import { useWorkoutHistory } from '@/hooks/use-workout-history'

interface PersonalWorkoutHistoryProps {
  studentId: string
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

function getStatusVariant(status: SessionStatus) {
  if (status === 'COMPLETED') return 'default' as const
  if (status === 'CANCELLED') return 'destructive' as const
  return 'secondary' as const
}

function getPlanName(session: SessionSummary) {
  return session.planName ?? session.planSnapshot.planName ?? 'Treino sem nome'
}

export function PersonalWorkoutHistory({ studentId }: PersonalWorkoutHistoryProps) {
  const { historyQuery, removeMutation } = useStudentWorkoutHistory(studentId)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState('table')
  const [month, setMonth] = useState(new Date())
  const calendarQuery = useWorkoutHistory(studentId, month)

  const handleRemove = async (sessionId: string) => {
    try {
      await removeMutation.mutateAsync(sessionId)
      toast.success('Treino marcado como não realizado')
    } catch {
      toast.error('Não foi possível alterar o histórico')
    }
  }

  if (historyQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  if (historyQuery.isError) {
    return (
      <EmptyState
        icon={<CalendarX size={48} strokeWidth={1} />}
        title="Não foi possível carregar o histórico"
        description="Verifique sua conexão e tente novamente."
        action={
          <Button size="sm" onClick={() => historyQuery.refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  if (!historyQuery.data?.total) {
    return (
      <EmptyState
        icon={<Dumbbell size={48} strokeWidth={1} />}
        title="Nenhum treino registrado"
        description="Os treinos realizados pelo aluno aparecerão aqui."
      />
    )
  }

  return (
    <div className="space-y-5">
      <TabNavigation
        value={view}
        onValueChange={setView}
        aria-label="Visualização do histórico do aluno"
        items={[{ value: 'table', label: 'Tabela' }, { value: 'calendar', label: 'Calendário' }]}
      />
      <p className="text-sm text-muted-foreground">
        {historyQuery.data.total}{' '}
        {historyQuery.data.total === 1 ? 'treino registrado' : 'treinos registrados'}
      </p>

      {view === 'calendar' ? (
        <HistoryCalendar
          month={month}
          sessions={calendarQuery.data?.data ?? []}
          loading={calendarQuery.isPending}
          onMonthChange={setMonth}
        />
      ) : historyQuery.data.groups.map((group) => (
        <section key={group.month} className="space-y-2">
          <h3 className="font-display text-sm font-semibold capitalize text-foreground">
            {group.month}
          </h3>
          {group.sessions.map((session) => (
            <ExpandedTableRow
              key={session.id}
              id={`personal-history-${session.id}`}
              expanded={expanded === session.id}
              onToggle={() => setExpanded(expanded === session.id ? null : session.id)}
              summary={
                <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  <span>{format(new Date(session.startedAt), 'dd')}</span>
                  <span>{format(new Date(session.startedAt), 'MMM', { locale: ptBR })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {getPlanName(session)}
                    </p>
                    <Badge variant={getStatusVariant(session.status)}>
                      {STATUS_LABELS[session.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(session.startedAt), 'EEEE, HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                  {session.durationSeconds !== null && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDuration(session.durationSeconds)}
                    </p>
                  )}
                </div>
                </div>
              }
              detail={
                <div className="flex justify-end">
                  <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Marcar ${getPlanName(session)} como não realizado`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  }
                  title="Marcar como não treinado"
                  description="A sessão, os exercícios e as cargas registradas serão removidos do histórico. O aluno poderá iniciar o treino deste dia novamente."
                  confirmLabel="Marcar como não treinado"
                  loading={removeMutation.isPending}
                  onConfirm={() => handleRemove(session.id)}
                  destructive
                  />
                </div>
              }
            />
          ))}
        </section>
      ))}
    </div>
  )
}
