import { useEffect } from 'react'
import { toast } from 'sonner'
import { usePWA } from '@/hooks/usePWA'

export function PWAUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWA()

  useEffect(() => {
    if (!updateAvailable) return
    toast.info('Nova versão disponível', {
      description: 'Atualize para obter as últimas melhorias.',
      duration: Infinity,
      action: { label: 'Atualizar agora', onClick: applyUpdate },
    })
  }, [updateAvailable, applyUpdate])

  return null
}
