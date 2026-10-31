import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useSession } from '@/contexts/SessionContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { TabNavigation } from '@/components/common/TabNavigation'
import { RHFAddressForm } from '@/components/common/RHFAddressForm'
import { addressSchema, emailSchema, phoneSchema } from '@/validation/profile.schemas'
import { NotificationPermissionCard } from '@/components/pwa/NotificationPermissionCard'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  email: emailSchema,
  phone: phoneSchema,
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type AddressValues = z.input<typeof addressSchema>

interface UserAddress extends AddressValues {
  id?: string
}

interface UserMe {
  id: string
  username: string
  role: string
  status: string
  studentProfile?: { name: string; email?: string; phone?: string }
  address?: UserAddress
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function StudentProfile() {
  const { logout } = useSession()
  const [user, setUser] = useState<UserMe | null>(null)
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil',
      ibgeCode: '',
    },
  })

  useEffect(() => {
    let mounted = true
    api
      .get<UserMe>('/users/me')
      .then(({ data }) => {
        if (!mounted) return
        setUser(data)
        const profile = data.studentProfile
        profileForm.reset({
          name: profile?.name ?? '',
          email: profile?.email ?? '',
          phone: profile?.phone ?? '',
        })
        if (data.address) addressForm.reset(data.address)
      })
      .catch(() => {
        if (mounted) toast.error('Erro ao carregar perfil')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [addressForm, profileForm])

  const onSaveProfile = async (values: ProfileValues) => {
    setSavingProfile(true)
    try {
      const { data } = await api.patch<UserMe>('/users/me/profile', values)
      setUser((current) => (current ? { ...current, ...data } : current))
      toast.success('Dados pessoais atualizados')
    } catch {
      toast.error('Erro ao salvar dados pessoais')
    } finally {
      setSavingProfile(false)
    }
  }

  const onSaveAddress = async (values: AddressValues) => {
    setSavingAddress(true)
    try {
      const { data } = await api.patch<UserAddress>('/users/me/address', values)
      setUser((current) => (current ? { ...current, address: data } : current))
      addressForm.reset(data)
      toast.success('Endereço atualizado')
    } catch {
      toast.error('Erro ao salvar endereço')
    } finally {
      setSavingAddress(false)
    }
  }

  const onChangePassword = async (values: PasswordValues) => {
    setChangingPassword(true)
    try {
      await api.patch('/users/me/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      toast.success('Senha alterada com sucesso')
    } catch {
      toast.error('Senha atual incorreta ou erro ao alterar')
    } finally {
      setChangingPassword(false)
    }
  }

  const initials =
    user?.studentProfile?.name?.slice(0, 2).toUpperCase() ??
    user?.username?.slice(0, 2).toUpperCase() ??
    '?'

  const tabs = [
    { value: 'personal', label: 'Dados pessoais' },
    { value: 'address', label: 'Endereço' },
    { value: 'security', label: 'Segurança' },
    { value: 'session', label: 'Sessão' },
  ] as const

  return (
    <div className="flex min-w-0 flex-col gap-5 px-4 pb-8 pt-4">
      <div className="flex flex-col items-center gap-3 py-3">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {initials}
        </div>
        {user && (
          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">
              {user.studentProfile?.name ?? user.username}
            </p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        )}
      </div>

      <TabNavigation
        items={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        aria-label="Configurações do perfil"
      />

      <NotificationPermissionCard />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Carregando perfil...
        </div>
      ) : (
        <>
          {activeTab === 'personal' && (
            <section id="personal-panel" role="tabpanel" aria-label="Dados pessoais" className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <Field label="Nome" error={profileForm.formState.errors.name?.message}>
                  <Input inputMode="text" autoComplete="name" {...profileForm.register('name')} />
                </Field>
                <Field label="E-mail" error={profileForm.formState.errors.email?.message}>
                  <Input type="email" inputMode="email" autoComplete="email" placeholder="opcional" {...profileForm.register('email')} />
                </Field>
                <Field label="Telefone" error={profileForm.formState.errors.phone?.message}>
                  <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="opcional" {...profileForm.register('phone')} />
                </Field>
              </div>
              <Button type="button" disabled={savingProfile} onClick={() => void profileForm.handleSubmit(onSaveProfile)()}>
                {savingProfile ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar dados pessoais'}
              </Button>
            </section>
          )}

          {activeTab === 'address' && (
            <section id="address-panel" role="tabpanel" aria-label="Endereço" className="flex flex-col gap-5">
              <FormProvider {...addressForm}>
                <RHFAddressForm />
              </FormProvider>
              <Button type="button" disabled={savingAddress} onClick={() => void addressForm.handleSubmit(onSaveAddress)()}>
                {savingAddress ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar endereço'}
              </Button>
            </section>
          )}

          {activeTab === 'security' && (
            <section id="security-panel" role="tabpanel" aria-label="Segurança">
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="flex flex-col gap-5">
                <Field label="Senha atual" error={passwordForm.formState.errors.currentPassword?.message}>
                  <PasswordInput autoComplete="current-password" {...passwordForm.register('currentPassword')} />
                </Field>
                <Field label="Nova senha" error={passwordForm.formState.errors.newPassword?.message}>
                  <PasswordInput autoComplete="new-password" {...passwordForm.register('newPassword')} />
                </Field>
                <Field label="Confirmar nova senha" error={passwordForm.formState.errors.confirmPassword?.message}>
                  <PasswordInput autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
                </Field>
                <Button type="submit" variant="outline" disabled={changingPassword}>
                  {changingPassword ? <><Loader2 size={14} className="animate-spin" /> Alterando...</> : 'Alterar senha'}
                </Button>
              </form>
            </section>
          )}

          {activeTab === 'session' && (
            <section id="session-panel" role="tabpanel" aria-label="Sessão" className="flex flex-col gap-5">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 font-medium text-foreground">
                  {user?.status === 'ACTIVE' ? 'Ativo' : user?.status ?? 'Indisponível'}
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void logout()}
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sair da conta
              </Button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
