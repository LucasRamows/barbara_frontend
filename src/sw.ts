/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string | null }>
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

interface PushPayload {
  title?: string
  body?: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

self.addEventListener('push', (event) => {
  const payload = (event.data?.json() ?? {}) as PushPayload
  const title = payload.title ?? 'Bárbara'

  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const visibleClient = clients.find((client) => (client as WindowClient).visibilityState === 'visible')
    if (visibleClient) {
      visibleClient.postMessage({ type: 'PUSH_NOTIFICATION', payload: { ...payload, title } })
      return
    }

    return self.registration.showNotification(title, {
      body: payload.body ?? 'Você tem uma nova atualização no Bárbara.',
      icon: payload.icon ?? '/logo.png',
      badge: payload.badge ?? '/logo.png',
      tag: payload.tag ?? 'barbara-notification',
      data: { url: payload.url ?? '/' },
    })
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL((event.notification.data?.url as string | undefined) ?? '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => 'focus' in client) as WindowClient | undefined
      if (existing) {
        void existing.focus()
        void existing.navigate(url)
        return
      }
      void self.clients.openWindow(url)
    }),
  )
})
