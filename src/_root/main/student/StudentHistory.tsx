import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TabNavigation } from '@/components/common/TabNavigation'
import { HistoryCalendar } from '@/components/common/HistoryCalendar'
import { ExpandedTableRow } from '@/components/common/ExpandedTableRow'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkoutHistory } from '@/hooks/use-workout-history'
import type { SessionStatus, SessionSummary } from '@/types/session.types'
import { formatDuration } from '@/lib/formatDuration'
import { cn } from '@/lib/utils'

const statusLabels: Record<SessionStatus, string> = {
  COMPLETED: 'Completo',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
  IN_PROGRESS: 'Em andamento',
}

const statusClasses: Record<SessionStatus, string> = {
  COMPLETED: 'bg-success/15 text-success',
  PARTIAL: 'bg-warning/15 text-status-warning-emphasis',
  CANCELLED: 'bg-destructive/15 text-destructive',
  IN_PROGRESS: 'bg-primary/10 text-primary',
}

function SessionSummary({ session }: { session: SessionSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize">
          {format(new Date(session.startedAt), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <p className="truncate text-xs text-muted-foreground">{session.planSnapshot?.planName ?? 'Treino livre'}</p>
      </div>
      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', statusClasses[session.status])}>
        {statusLabels[session.status]}
      </span>
    </div>
  )
}

export default function StudentHistory() {
  const navigate = useNavigate()
  const [view, setView] = useState('table')
  const [month, setMonth] = useState(new Date())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<SessionSummary[] | null>(null)
  const history = useWorkoutHistory()
  const calendarHistory = useWorkoutHistory(undefined, month)
  const sessions = history.data?.data ?? []

  if (history.isPending) {
    return <div className="space-y-3 p-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div>
  }
  if (history.isError) {
    return <div className="p-6 text-center"><p className="text-sm text-muted-foreground">Não foi possível carregar o histórico.</p><Button className="mt-3" onClick={() => history.refetch()}>Tentar novamente</Button></div>
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Histórico</h1>
      <TabNavigation
        value={view}
        onValueChange={setView}
        aria-label="Visualização do histórico"
        items={[
          { value: 'table', label: 'Tabela', badge: history.data?.total },
          { value: 'calendar', label: 'Calendário' },
        ]}
      />
      {view === 'calendar' ? (
        <>
          <HistoryCalendar
            month={month}
            sessions={calendarHistory.data?.data ?? []}
            loading={calendarHistory.isPending}
            onMonthChange={(nextMonth) => { setMonth(nextMonth); setSelectedDay(null) }}
            onSelectDay={(_, daySessions) => setSelectedDay(daySessions)}
          />
          {selectedDay && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Sessões do dia</h2>
              {selectedDay.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma sessão neste dia.</p> : selectedDay.map((session) => <ExpandedTableRow key={session.id} id={`calendar-${session.id}`} expanded={expanded === session.id} onToggle={() => setExpanded(expanded === session.id ? null : session.id)} summary={<SessionSummary session={session} />} detail={<SessionDetail session={session} onOpen={() => navigate(`/historico/${session.id}`)} />} />)}
            </div>
          )}
        </>
      ) : (
        sessions.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma sessão registrada ainda.</p> : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <ExpandedTableRow
                key={session.id}
                id={`history-${session.id}`}
                expanded={expanded === session.id}
                onToggle={() => setExpanded(expanded === session.id ? null : session.id)}
                summary={<SessionSummary session={session} />}
                detail={<SessionDetail session={session} onOpen={() => navigate(`/historico/${session.id}`)} />}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function SessionDetail({ session, onOpen }: { session: SessionSummary; onOpen: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span>{format(new Date(session.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
      <span>{session.durationSeconds ? formatDuration(session.durationSeconds) : 'Duração não informada'}</span>
      {session.isDeload && <span>Deload</span>}
      <Button variant="link" size="sm" className="ml-auto h-auto p-0" onClick={onOpen}>Ver exercícios</Button>
    </div>
  )
}
