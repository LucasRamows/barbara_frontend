import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth/auth.service'
import type { AuthUser, Role } from '@/types/auth.types'
import { clearSessionQueries } from '@/lib/query-client'

interface SessionContextType {
  user: AuthUser | null
  sessionReady: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

function homeForRole(role: Role): string {
  if (role === 'SUPER_ADMIN') return '/admin'
  if (role === 'PERSONAL') return '/personal'
  return '/'
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    setUser(authService.getStoredUser())
    setSessionReady(true)

    const handleLogout = () => {
      void clearSessionQueries()
      setUser(null)
      navigate('/sign-in', { replace: true })
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])

  const login = async (identifier: string, password: string) => {
    const result = await authService.login(identifier, password)
    setUser(result.user)
    navigate(homeForRole(result.user.role), { replace: true })
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    navigate('/sign-in', { replace: true })
  }

  return (
    <SessionContext.Provider
      value={{ user, sessionReady, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </SessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession deve ser usado dentro de SessionProvider')
  return ctx
}
