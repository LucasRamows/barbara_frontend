import { Outlet } from 'react-router-dom'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />
      <main className="mobile-header-safe-offset mobile-bottom-safe-offset flex flex-1 flex-col">
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  )
}
