import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavTab {
  to: string
  label: string
  Icon: LucideIcon
}

interface BottomNavProps {
  tabs: NavTab[]
}

export function BottomNav({ tabs }: BottomNavProps) {
  return (
    <nav className="mobile-bottom-safe-area fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card md:hidden">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
              'min-h-[44px]',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
