import { api } from '@/lib/api'

export interface PushSubscriptionPayload {
  endpoint: string
  expirationTime: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

export const pushNotificationsService = {
  getPublicKey: () => api.get<{ publicKey: string | null }>('/notifications/push/public-key').then((r) => r.data.publicKey),
  register: (subscription: PushSubscriptionPayload) =>
    api.post('/notifications/push/subscriptions', subscription),

  unregister: (endpoint: string) =>
    api.delete('/notifications/push/subscriptions', { data: { endpoint } }),
}
