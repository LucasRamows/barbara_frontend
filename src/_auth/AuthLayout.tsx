import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import type { Role } from '@/types/auth.types'

function homeForRole(role: Role): string {
  if (role === 'SUPER_ADMIN') return '/admin'
  if (role === 'PERSONAL') return '/personal'
  return '/'
}

export default function AuthLayout() {
  const { user, sessionReady } = useSession()

  if (!sessionReady) return null
  if (user) return <Navigate to={homeForRole(user.role)} replace />

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  )
}
