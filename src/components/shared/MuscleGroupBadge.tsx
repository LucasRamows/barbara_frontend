import { cn } from '@/lib/utils'
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from '@/types/exercise.types'

interface MuscleGroupBadgeProps {
  group: MuscleGroup
  className?: string
}

export function MuscleGroupBadge({ group, className }: MuscleGroupBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
        className,
      )}
    >
      {MUSCLE_GROUP_LABELS[group]}
    </span>
  )
}
