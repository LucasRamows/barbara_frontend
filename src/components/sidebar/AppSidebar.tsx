import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from '@/components/ui/sidebar'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { NavItems, type NavItem } from './NavItems'
import { NavUser } from './NavUser'
import { ThemeToggle } from './ThemeToggle'
import { useSession } from '@/contexts/SessionContext'

interface AppSidebarProps {
  navItems: NavItem[]
}

export function AppSidebar({ navItems }: AppSidebarProps) {
  const { user, logout } = useSession()

  return (
    <Sidebar
      collapsible="icon"
      className="hidden h-full border-r border-sidebar-border bg-sidebar/90 backdrop-blur-xl md:flex"
    >
      <SidebarBrandHeader />
      <SidebarContent>
        <NavItems items={navItems} />
      </SidebarContent>
      <div className="px-2 pb-1">
        <ThemeToggle />
      </div>
      <NavUser
        userName={user?.name ?? ''}
        role={user?.role ?? ''}
        onLogout={logout}
      />
      <SidebarRail />
    </Sidebar>
  )
}
