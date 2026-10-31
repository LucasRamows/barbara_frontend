import { api, apiPublic } from '@/lib/api'
import type { AuthUser, LoginResponse } from '@/types/auth.types'
import { clearSessionQueries } from '@/lib/query-client'

const KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const { data } = await apiPublic.post<LoginResponse>('/auth/login', { identifier, username: identifier, password })
    localStorage.setItem(KEYS.accessToken, data.accessToken)
    localStorage.setItem(KEYS.refreshToken, data.refreshToken)
    localStorage.setItem(KEYS.user, JSON.stringify(data.user))
    return data
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(KEYS.refreshToken)
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
      // fire & forget
    } finally {
      await clearSessionQueries()
      localStorage.removeItem(KEYS.accessToken)
      localStorage.removeItem(KEYS.refreshToken)
      localStorage.removeItem(KEYS.user)
    }
  },

  getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(KEYS.user)
      if (!raw) return null
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  async refreshTokens() {
    const refreshToken = localStorage.getItem(KEYS.refreshToken)
    if (!refreshToken) throw new Error('no refresh token')
    const { data } = await apiPublic.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    )
    localStorage.setItem(KEYS.accessToken, data.accessToken)
    localStorage.setItem(KEYS.refreshToken, data.refreshToken)
    return data
  },
}
