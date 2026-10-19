import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { StudentSidebar } from '@/components/sidebar/StudentSidebar'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { StudentBottomNav } from '@/components/navigation/StudentBottomNav'

export function StudentLayout() {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <MobileHeader />
        <main className="mobile-header-safe-offset mobile-bottom-safe-offset flex flex-1 flex-col overflow-y-auto md:pt-0 md:pb-0 md:p-6">
          <Outlet />
        </main>
        <StudentBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
