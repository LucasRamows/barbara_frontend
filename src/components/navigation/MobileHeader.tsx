import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { BarbaraLogo } from '@/components/brand/BarbaraLogo'

function MobileThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="size-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </Button>
  )
}

export function MobileHeader() {
  return (
    <header className="mobile-header-safe-area fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/90 backdrop-blur-xl md:hidden">
      <BarbaraLogo variant="wordmark" title="Bárbara" className="text-primary" />
      <MobileThemeToggle />
    </header>
  )
}
