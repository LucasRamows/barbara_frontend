import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SidebarFooter, useSidebar } from '@/components/ui/sidebar'

interface NavUserProps {
  userName: string
  role: string
  onLogout: () => void
}

const roleLabels: Record<string, string> = {
  ALUNO: 'Aluno',
  PERSONAL: 'Personal',
  SUPER_ADMIN: 'Administrador',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function NavUser({ userName, role, onLogout }: NavUserProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const initials = getInitials(userName || 'U')
  const roleLabel = roleLabels[role] ?? role

  return (
    <SidebarFooter className="border-t border-sidebar-border p-3">
      {isCollapsed ? (
        <div className="flex justify-center">
          <div
            title={`${userName} — ${roleLabel}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {initials}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-card p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sair"
            aria-label="Sair"
            className={cn('size-8 shrink-0 text-muted-foreground hover:text-foreground')}
          >
            <LogOut size={16} strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </SidebarFooter>
  )
}
