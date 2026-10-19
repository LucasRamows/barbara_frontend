import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

function MobileThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme()

  function cycle() {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const Icon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun
  const label = theme === 'system' ? 'Sistema' : resolvedTheme === 'dark' ? 'Escuro' : 'Claro'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Tema atual: ${label}. Clique para alternar`}
      className="size-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Icon size={18} strokeWidth={1.5} />
    </Button>
  )
}

export function MobileHeader() {
  return (
    <header className="mobile-header-safe-area fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/90 backdrop-blur-xl md:hidden">
      <span className="font-display text-xl font-bold text-primary">Bárbara</span>
      <MobileThemeToggle />
    </header>
  )
}
