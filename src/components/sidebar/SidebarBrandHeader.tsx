import { useSidebar } from '@/components/ui/sidebar'
import { SidebarHeader } from '@/components/ui/sidebar'
import { BarbaraLogo } from '@/components/brand/BarbaraLogo'

export function SidebarBrandHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarHeader className="border-b border-sidebar-border p-4">
      {isCollapsed ? (
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BarbaraLogo className="size-5" title="Bárbara" />
        </div>
      ) : (
        <BarbaraLogo variant="wordmark" title="Bárbara" className="text-primary" />
      )}
    </SidebarHeader>
  )
}
