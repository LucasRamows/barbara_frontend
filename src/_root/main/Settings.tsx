import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { applyTheme, getInitialTheme } from '@/lib/theme'

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <div className="p-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <p className="font-medium text-foreground">Tema</p>
          <p className="text-sm text-muted-foreground">{theme === 'light' ? 'Claro' : 'Escuro'}</p>
        </div>
        <Button variant="outline" size="icon" onClick={toggle} aria-label="Alternar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </div>
    </div>
  )
}
