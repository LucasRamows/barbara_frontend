import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
]

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'sm'}
          aria-label="Alternar tema"
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed ? 'size-8' : 'w-full justify-start gap-2 px-2',
          )}
        >
          <CurrentIcon size={16} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm">Tema</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-40">
        {options.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'gap-2',
              theme === value && 'bg-accent text-accent-foreground',
            )}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
