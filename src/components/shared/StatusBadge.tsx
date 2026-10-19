import { cn } from '@/lib/utils'

type Status = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Ativo',
    className: 'bg-[hsl(var(--status-success)/0.12)] text-[var(--status-success)]',
  },
  BLOCKED: {
    label: 'Bloqueado',
    className: 'bg-destructive/10 text-destructive',
  },
  INACTIVE: {
    label: 'Inativo',
    className: 'bg-muted text-muted-foreground',
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
