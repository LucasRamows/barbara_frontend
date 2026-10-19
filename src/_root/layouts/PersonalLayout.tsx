import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { PersonalSidebar } from '@/components/sidebar/PersonalSidebar'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { PersonalBottomNav } from '@/components/navigation/PersonalBottomNav'

export function PersonalLayout() {
  return (
    <SidebarProvider>
      <PersonalSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <MobileHeader />
        <main className="mobile-header-safe-offset mobile-bottom-safe-offset flex flex-1 flex-col overflow-y-auto md:pt-0 md:pb-0 md:p-6">
          <Outlet />
        </main>
        <PersonalBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
