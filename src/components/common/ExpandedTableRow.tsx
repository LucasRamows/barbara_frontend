import type { ReactNode } from 'react'
import { ChevronDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandedTableRowProps {
  id: string
  expanded: boolean
  onToggle: () => void
  summary: ReactNode
  detail: ReactNode
  className?: string
}

export function ExpandedTableRow({
  id,
  expanded,
  onToggle,
  summary,
  detail,
  className,
}: ExpandedTableRowProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-expanded={expanded}
        aria-controls={`${id}-detail`}
        onClick={onToggle}
      >
        <Eye className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
      </button>
      {expanded && (
        <div id={`${id}-detail`} className="border-t border-border p-4">
          {detail}
        </div>
      )}
    </div>
  )
}
