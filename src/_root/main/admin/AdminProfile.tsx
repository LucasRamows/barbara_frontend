import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useSession } from '@/contexts/SessionContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function AdminProfile() {
  const { logout } = useSession()
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

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'SA'

  return (
    <div className="flex flex-col gap-0 pb-8">
      {/* Avatar header */}
      <div className="flex flex-col items-center gap-3 px-4 py-6">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {initials}
        </div>
        {user && (
          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">@{user.username}</p>
            <p className="text-sm text-primary font-medium">Super Admin</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Conta (read-only) */}
      {user && (
        <>
          <div className="px-4 py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Conta</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuário</span>
                <span className="text-sm font-medium text-foreground">@{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Permissão</span>
                <span className="text-sm font-medium text-primary">Super Admin</span>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Segurança */}
      <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
        <div className="px-4 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Segurança</p>
          <div className="flex flex-col gap-4">
            <Field label="Senha atual" error={passwordForm.formState.errors.currentPassword?.message}>
              <PasswordInput autoComplete="current-password" {...passwordForm.register('currentPassword')} />
            </Field>
            <Field label="Nova senha" error={passwordForm.formState.errors.newPassword?.message}>
              <PasswordInput autoComplete="new-password" {...passwordForm.register('newPassword')} />
            </Field>
            <Field label="Confirmar nova senha" error={passwordForm.formState.errors.confirmPassword?.message}>
              <PasswordInput autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
            </Field>
          </div>
        </div>
        <div className="px-4 pb-2">
          <Button type="submit" variant="outline" className="w-full" disabled={changingPw}>
            {changingPw ? <><Loader2 size={14} className="animate-spin" /> Alterando...</> : 'Alterar senha'}
          </Button>
        </div>
      </form>

      <Separator className="mt-4" />

      <div className="px-4 py-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sessão</p>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair da conta
        </Button>
      </div>
    </div>
  )
}
