import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function NotificationPermissionCard() {
  const { supported, permission, subscribed, loading, enable, disable } = usePushNotifications()

  if (!supported) return null

  const toggle = async () => {
    try {
      const success = subscribed ? (await disable(), true) : await enable()
      if (!success && !subscribed) toast.error('Permissão para notificações não concedida')
      else if (!subscribed) toast.success('Notificações ativadas')
      else toast.success('Notificações desativadas')
    } catch {
      toast.error('Não foi possível configurar as notificações')
    }
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {subscribed ? <Bell className="mt-0.5 text-primary" size={20} /> : <BellOff className="mt-0.5 text-muted-foreground" size={20} />}
        <div>
          <p className="font-medium text-foreground">Notificações do app</p>
          <p className="text-sm text-muted-foreground">
            {permission === 'denied' ? 'Permissão bloqueada nas configurações do dispositivo.' : 'Receba avisos quando seu treino for concluído ou alterado.'}
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={toggle} disabled={loading || permission === 'denied'}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {subscribed ? 'Desativar' : 'Ativar'}
      </Button>
    </div>
  )
}
