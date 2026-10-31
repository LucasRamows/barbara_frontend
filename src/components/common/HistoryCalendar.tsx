import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SessionStatus, SessionSummary } from '@/types/session.types'

interface HistoryCalendarProps {
  sessions: SessionSummary[]
  month: Date
  onMonthChange: (month: Date) => void
  onSelectDay?: (day: Date, sessions: SessionSummary[]) => void
  loading?: boolean
}

const statusColors: Record<SessionStatus, string> = {
  COMPLETED: 'bg-success',
  PARTIAL: 'bg-status-warning',
  CANCELLED: 'bg-destructive',
  IN_PROGRESS: 'bg-primary',
}

export function HistoryCalendar({ sessions, month, onMonthChange, onSelectDay, loading }: HistoryCalendarProps) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const leading = (getDay(startOfMonth(month)) + 6) % 7
  const byDay = new Map<string, SessionSummary[]>()
  sessions.forEach((session) => {
    const key = format(new Date(session.startedAt), 'yyyy-MM-dd')
    byDay.set(key, [...(byDay.get(key) ?? []), session])
  })

  return (
    <div className="rounded-2xl border border-border bg-card p-4" aria-busy={loading}>
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => onMonthChange(subMonths(month, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold capitalize">{format(month, 'MMMM yyyy', { locale: ptBR })}</h2>
        <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => onMonthChange(addMonths(month, 1))}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((label, index) => <span key={`${label}-${index}`} className="py-1">{label}</span>)}
        {Array.from({ length: leading }, (_, index) => <span key={`empty-${index}`} />)}
        {days.map((day) => {
          const daySessions = byDay.get(format(day, 'yyyy-MM-dd')) ?? []
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => onSelectDay?.(day, daySessions)}
              aria-label={`${format(day, "d 'de' MMMM", { locale: ptBR })}, ${daySessions.length} sessões`}
              className="flex min-h-12 flex-col items-center justify-start gap-1 rounded-lg py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={cn('flex size-7 items-center justify-center rounded-full text-xs', isSameDay(day, new Date()) && 'bg-primary font-bold text-primary-foreground')}>
                {format(day, 'd')}
              </span>
              <span className="flex min-h-1.5 gap-0.5">
                {daySessions.map((session) => <span key={session.id} className={cn('size-1.5 rounded-full', statusColors[session.status])} />)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
