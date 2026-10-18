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

  if (user) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          <p className="mb-8 font-display text-3xl font-bold text-primary md:hidden">Bárbara</p>
          <Outlet />
        </div>
      </div>
      <div className="hidden flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary to-primary-hover md:flex md:w-1/2">
        <p className="font-display text-5xl font-bold text-white">Bárbara</p>
        <p className="text-lg text-white/80">Gestão e acompanhamento de alunos</p>
      </div>
    </div>
  )
}
