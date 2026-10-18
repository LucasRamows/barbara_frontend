import { Outlet } from 'react-router-dom'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { PersonalBottomNav } from '@/components/navigation/PersonalBottomNav'

export function PersonalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />
      <main className="mobile-header-safe-offset mobile-bottom-safe-offset flex flex-1 flex-col">
        <Outlet />
      </main>
      <PersonalBottomNav />
    </div>
  )
}
