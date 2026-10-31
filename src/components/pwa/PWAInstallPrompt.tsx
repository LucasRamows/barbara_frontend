import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/usePWA'

export function PWAInstallPrompt() {
  const { canInstall, promptInstall, markInstallPromptSeen } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (canInstall) markInstallPromptSeen()
  }, [canInstall, markInstallPromptSeen])

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg md:bottom-6 md:left-auto md:right-6 md:max-w-xs">
      <Download size={20} className="shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground">Instalar o aplicativo Bárbara</p>
      <Button size="sm" onClick={promptInstall}>
        Instalar
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dispensar"
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  )
}
