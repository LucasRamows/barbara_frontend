import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const { user } = useSession()
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [browserId] = useState(() => {
    const key = 'barbara:pwa-browser-id:v1'
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const generated = crypto.randomUUID()
    localStorage.setItem(key, generated)
    return generated
  })
  const preferenceKey = useMemo(
    () => (user ? `barbara:pwa-install-prompt:v1:${user.id}:${browserId}` : null),
    [browserId, user],
  )
  const [installPromptSeen, setInstallPromptSeen] = useState(false)

  useEffect(() => {
    setInstallPromptSeen(Boolean(preferenceKey && localStorage.getItem(preferenceKey) === 'seen'))
  }, [preferenceKey])

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mq.matches)
    const mqHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mq.addEventListener('change', mqHandler)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return
        setRegistration(reg)
        if (reg.waiting) setUpdateAvailable(true)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })
      })
    }

    return () => {
      mq.removeEventListener('change', mqHandler)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }, [installPrompt])

  const markInstallPromptSeen = useCallback(() => {
    if (!preferenceKey) return
    localStorage.setItem(preferenceKey, 'seen')
  }, [preferenceKey])

  const applyUpdate = useCallback(() => {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }, [registration])

  return {
    canInstall: !!installPrompt && !isInstalled && !!user && !installPromptSeen,
    installPromptSeen,
    markInstallPromptSeen,
    isInstalled,
    updateAvailable,
    promptInstall,
    applyUpdate,
  }
}
