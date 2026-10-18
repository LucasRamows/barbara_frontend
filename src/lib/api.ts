import axios from 'axios'
import type { AuthTokens } from '@/types/auth.types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiPublic = axios.create({ baseURL: BASE_URL })

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    original._retried = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('no refresh token')

      const { data } = await apiPublic.post<AuthTokens>('/auth/refresh', { refreshToken })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []

      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
