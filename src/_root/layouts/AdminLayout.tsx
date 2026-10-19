import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/sidebar/AdminSidebar'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav'

export function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <MobileHeader />
        <main className="mobile-header-safe-offset mobile-bottom-safe-offset flex flex-1 flex-col overflow-y-auto md:pt-0 md:pb-0 md:p-6">
          <Outlet />
        </main>
        <AdminBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
