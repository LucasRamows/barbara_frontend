import { useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TabNavigationItem {
  value: string
  label: string
  badge?: number | string
  disabled?: boolean
}

export interface TabNavigationProps {
  items: readonly TabNavigationItem[]
  value: string
  onValueChange: (value: string) => void
  'aria-label'?: string
  className?: string
}

export function TabNavigation({
  items,
  value,
  onValueChange,
  'aria-label': ariaLabel = 'Seções',
  className,
}: TabNavigationProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const focusTab = (index: number) => {
    const tab = tabRefs.current[index]
    if (!tab || tab.disabled) return
    tab.focus()
    onValueChange(items[index].value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    const enabledIndexes = items.reduce<number[]>((indexes, item, itemIndex) => {
      if (!item.disabled) indexes.push(itemIndex)
      return indexes
    }, [])
    if (enabledIndexes.length === 0) return

    const currentPosition = enabledIndexes.indexOf(index)
    const nextPosition =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabledIndexes.length - 1
          : (currentPosition + (event.key === 'ArrowRight' ? 1 : -1) + enabledIndexes.length) % enabledIndexes.length

    focusTab(enabledIndexes[nextPosition])
  }

  return (
    <div className={cn('w-full min-w-0 overflow-x-auto overscroll-x-contain', className)}>
      <div role="tablist" aria-label={ariaLabel} className="flex min-w-max gap-1 border-b border-border">
        {items.map((item, index) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${item.value}-panel`}
              tabIndex={active ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors',
                'after:absolute after:inset-x-1 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent',
                'hover:text-foreground focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                active && 'text-foreground after:bg-primary',
              )}
            >
              {item.label}
              {item.badge !== undefined && (
                <span
                  aria-label={`${item.badge} itens`}
                  className={cn(
                    'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-5',
                    active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
