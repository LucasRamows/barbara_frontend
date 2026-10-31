import { useCallback, useEffect, useState } from 'react'
import { pushNotificationsService, type PushSubscriptionPayload } from '@/services/push-notifications/push-notifications.service'

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

function serializeSubscription(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON()
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState(vapidPublicKey)

  const browserSupportsPush = typeof window !== 'undefined' &&
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  const supported = browserSupportsPush && !!publicKey

  useEffect(() => {
    if (!browserSupportsPush) {
      setPermission('unsupported')
      return
    }
    if (!publicKey) {
      void pushNotificationsService.getPublicKey().then((key) => setPublicKey(key ?? undefined)).catch(() => undefined)
    }
  }, [browserSupportsPush, publicKey])

  useEffect(() => {
    if (!supported) {
      return
    }
    setPermission(Notification.permission)
    navigator.serviceWorker.ready.then((registration) =>
      registration.pushManager.getSubscription().then((subscription) => setSubscribed(!!subscription)),
    )
  }, [supported])

  const enable = useCallback(async () => {
    if (!supported || !publicKey) return false
    setLoading(true)
    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)
      if (nextPermission !== 'granted') return false

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      await pushNotificationsService.register(serializeSubscription(subscription))
      setSubscribed(true)
      return true
    } finally {
      setLoading(false)
    }
  }, [publicKey, supported])

  const disable = useCallback(async () => {
    if (!supported) return
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return
      await pushNotificationsService.unregister(subscription.endpoint)
      await subscription.unsubscribe()
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [supported])

  return { supported, permission, subscribed, loading, enable, disable }
}
