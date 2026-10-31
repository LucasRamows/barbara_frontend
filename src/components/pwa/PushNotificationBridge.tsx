import { useEffect } from 'react'
import { toast } from 'sonner'

interface PushMessage {
  type: 'PUSH_NOTIFICATION'
  payload?: { title?: string; body?: string; url?: string }
}

export function PushNotificationBridge() {
  useEffect(() => {
    const handler = (event: MessageEvent<PushMessage>) => {
      if (event.data?.type !== 'PUSH_NOTIFICATION') return
      const payload = event.data.payload
      toast.info(payload?.title ?? 'Nova atualização', {
        description: payload?.body,
        action: payload?.url ? { label: 'Abrir', onClick: () => { window.location.href = payload.url! } } : undefined,
      })
    }

    navigator.serviceWorker?.addEventListener('message', handler)
    return () => navigator.serviceWorker?.removeEventListener('message', handler)
  }, [])

  return null
}
