import { api } from '@/lib/api'

export interface PlatformSetting {
  key: string
  value: string
  description: string | null
  updatedAt: string
}

export const platformSettingsService = {
  getAll: () => api.get<PlatformSetting[]>('/platform-settings').then(r => r.data),

  upsert: (key: string, value: string, description?: string) =>
    api.put<PlatformSetting>(`/platform-settings/${key}`, { value, description }).then(r => r.data),
}
