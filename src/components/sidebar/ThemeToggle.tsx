import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Button
      variant="ghost"
      size={isCollapsed ? 'icon' : 'sm'}
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={cn(
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isCollapsed ? 'size-8' : 'w-full justify-start gap-2 px-2',
      )}
    >
      {isDark
        ? <Sun size={16} strokeWidth={1.5} />
        : <Moon size={16} strokeWidth={1.5} />}
      {!isCollapsed && (
        <span className="text-sm">{isDark ? 'Claro' : 'Escuro'}</span>
      )}
    </Button>
  )
}
