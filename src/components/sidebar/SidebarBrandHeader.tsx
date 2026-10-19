import { useSidebar } from '@/components/ui/sidebar'
import { SidebarHeader } from '@/components/ui/sidebar'

export function SidebarBrandHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarHeader className="border-b border-sidebar-border p-4">
      {isCollapsed ? (
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <span className="font-display text-sm font-bold text-primary-foreground">B</span>
        </div>
      ) : (
        <span className="font-display text-xl font-bold text-primary">Bárbara</span>
      )}
    </SidebarHeader>
  )
}
