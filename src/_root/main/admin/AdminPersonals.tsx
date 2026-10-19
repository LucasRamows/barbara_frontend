import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MoreVertical, Plus, UserCheck, UserMinus, Ban, Trash2, KeyRound, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { adminService, type PersonalRow, type CreatePersonalData, type UpdatePersonalData } from '@/services/admin/admin.service'

const STATUS_CONFIG = {
  ACTIVE: { label: 'Ativo', className: 'bg-success/15 text-success' },
  INACTIVE: { label: 'Inativo', className: 'bg-muted text-muted-foreground' },
  BLOCKED: { label: 'Bloqueado', className: 'bg-destructive/15 text-destructive' },
}

// ─── Create Sheet ─────────────────────────────────────────────────────────────
function CreatePersonalSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (p: PersonalRow) => void
}) {
  const [form, setForm] = useState<CreatePersonalData>({ username: '', password: '', name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePersonalData, string>>>({})

  function validate() {
    const e: typeof errors = {}
    if (!form.username.trim()) e.username = 'Obrigatório'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (!form.name.trim()) e.name = 'Obrigatório'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const created = await adminService.createPersonal({
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
      })
      onCreated(created)
      toast.success(`Personal @${form.username} cadastrado com sucesso.`)
      onClose()
      setForm({ username: '', password: '', name: '', email: '', phone: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Erro ao cadastrar personal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Personal</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-username">Usuário <span className="text-destructive">*</span></Label>
            <Input
              id="c-username"
              autoCapitalize="none"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-password">Senha temporária <span className="text-destructive">*</span></Label>
            <PasswordInput
              id="c-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: (e.target as HTMLInputElement).value }))}
            />
            <p className="text-xs text-muted-foreground">O personal será obrigado a trocar no primeiro acesso.</p>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-name">Nome completo <span className="text-destructive">*</span></Label>
            <Input
              id="c-name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-email">E-mail <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              id="c-email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-phone">Telefone <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              id="c-phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Edit Sheet ───────────────────────────────────────────────────────────────
function EditPersonalSheet({
  personal,
  onClose,
  onUpdated,
}: {
  personal: PersonalRow | null
  onClose: () => void
  onUpdated: (p: PersonalRow) => void
}) {
  const [form, setForm] = useState<UpdatePersonalData>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (personal) {
      setForm({
        name: personal.personalProfile?.name ?? '',
        email: personal.personalProfile?.email ?? '',
        phone: personal.personalProfile?.phone ?? '',
        bio: personal.personalProfile?.bio ?? '',
      })
    }
  }, [personal])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!personal) return
    setSubmitting(true)
    try {
      const updated = await adminService.updatePersonal(personal.id, {
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
      })
      onUpdated(updated)
      toast.success('Dados atualizados.')
      onClose()
    } catch {
      toast.error('Erro ao atualizar personal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={!!personal} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Personal</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-name">Nome completo</Label>
            <Input id="e-name" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-email">E-mail</Label>
            <Input id="e-email" type="email" inputMode="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-phone">Telefone</Label>
            <Input id="e-phone" type="tel" inputMode="tel" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-bio">Bio <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input id="e-bio" value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Reset Password Sheet ─────────────────────────────────────────────────────
function ResetPasswordSheet({
  personal,
  onClose,
}: {
  personal: PersonalRow | null
  onClose: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Mínimo 6 caracteres.'); return }
    if (password !== confirm) { toast.error('As senhas não coincidem.'); return }
    if (!personal) return
    setSubmitting(true)
    try {
      await adminService.resetPersonalPassword(personal.id, password)
      toast.success('Senha redefinida. O personal deverá trocar no próximo acesso.')
      onClose()
      setPassword('')
      setConfirm('')
    } catch {
      toast.error('Erro ao redefinir senha.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={!!personal} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Redefinir Senha</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Definindo nova senha para <strong>@{personal?.username}</strong>. O personal será obrigado a trocar no próximo acesso.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-pw">Nova senha</Label>
            <PasswordInput id="r-pw" value={password} onChange={e => setPassword((e.target as HTMLInputElement).value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-pw2">Confirmar senha</Label>
            <PasswordInput id="r-pw2" value={confirm} onChange={e => setConfirm((e.target as HTMLInputElement).value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPersonals() {
  const [personals, setPersonals] = useState<PersonalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PersonalRow | null>(null)
  const [resetTarget, setResetTarget] = useState<PersonalRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PersonalRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    adminService.getPersonals()
      .then(setPersonals)
      .catch(() => toast.error('Erro ao carregar personals'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(p: PersonalRow, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    setUpdating(p.id)
    try {
      await adminService.updatePersonalStatus(p.id, status)
      setPersonals(prev => prev.map(x => x.id === p.id ? { ...x, status } : x))
      toast.success('Status atualizado.')
    } catch {
      toast.error('Erro ao atualizar status.')
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.removePersonal(deleteTarget.id)
      setPersonals(prev => prev.filter(x => x.id !== deleteTarget.id))
      toast.success('Personal removido.')
      setDeleteTarget(null)
    } catch {
      toast.error('Erro ao remover personal.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = personals.filter(p => {
    const q = search.toLowerCase()
    const name = p.personalProfile?.name ?? ''
    return name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Personals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie os profissionais da plataforma.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus size={16} />
          Novo Personal
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome ou usuário..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
          <p className="text-sm font-medium text-foreground">
            {search ? 'Nenhum personal encontrado' : 'Nenhum personal cadastrado'}
          </p>
          {!search && (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              Cadastrar primeiro personal
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => {
            const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.INACTIVE
            const name = p.personalProfile?.name ?? p.username
            const email = p.personalProfile?.email
            const phone = p.personalProfile?.phone

            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-lg">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                  {(email || phone) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {email}{email && phone ? ' · ' : ''}{phone}
                    </p>
                  )}
                </div>

                <Badge className={`hidden shrink-0 sm:flex ${statusCfg.className}`}>
                  {statusCfg.label}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-9 shrink-0" disabled={updating === p.id}>
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setEditTarget(p)}>
                      <Pencil size={14} />
                      Editar dados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setResetTarget(p)}>
                      <KeyRound size={14} />
                      Redefinir senha
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p, 'ACTIVE')}
                      disabled={p.status === 'ACTIVE'}
                    >
                      <UserCheck size={14} />
                      Ativar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p, 'INACTIVE')}
                      disabled={p.status === 'INACTIVE'}
                    >
                      <UserMinus size={14} />
                      Desativar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p, 'BLOCKED')}
                      disabled={p.status === 'BLOCKED'}
                      className="text-destructive focus:text-destructive"
                    >
                      <Ban size={14} />
                      Bloquear
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 size={14} />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      )}

      <CreatePersonalSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={p => setPersonals(prev => [p, ...prev])}
      />

      <EditPersonalSheet
        personal={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={updated =>
          setPersonals(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x))
        }
      />

      <ResetPasswordSheet
        personal={resetTarget}
        onClose={() => setResetTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title="Remover Personal"
        description={`Tem certeza que deseja remover @${deleteTarget?.username}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
