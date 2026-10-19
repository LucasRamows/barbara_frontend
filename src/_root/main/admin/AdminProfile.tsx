import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PasswordInput } from '@/components/shared/PasswordInput'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

interface UserMe { id: string; username: string; role: string; status: string }

export default function AdminProfile() {
  const [user, setUser] = useState<UserMe | null>(null)
  const [changingPw, setChangingPw] = useState(false)

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    api.get<UserMe>('/users/me').then((r) => setUser(r.data)).catch(() => {})
  }, [])

  const onChangePassword = async (values: PasswordValues) => {
    setChangingPw(true)
    try {
      await api.patch('/users/me/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Senha alterada com sucesso')
      passwordForm.reset()
    } catch {
      toast.error('Senha atual incorreta ou erro ao alterar')
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-foreground">Meu perfil</h1>

      {user && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck size={16} className="text-primary" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuário</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Papel</span>
              <span className="font-medium text-primary">Super Admin</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Senha atual</Label>
              <PasswordInput autoComplete="current-password" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Nova senha</Label>
              <PasswordInput autoComplete="new-password" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Confirmar nova senha</Label>
              <PasswordInput autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={changingPw} className="self-end">
              {changingPw ? <><Loader2 size={14} className="animate-spin" /> Alterando...</> : 'Alterar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
