import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { adminService } from '@/services/admin/admin.service'
import type { PersonalRow } from '@/services/admin/admin.service'

const STATUS_CONFIG = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  INACTIVE: { label: 'Inativo', className: '' },
  BLOCKED: { label: 'Bloqueado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export default function AdminPersonals() {
  const [personals, setPersonals] = useState<PersonalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    adminService.getPersonals()
      .then(setPersonals)
      .catch(() => toast.error('Erro ao carregar personals'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    setUpdating(userId)
    try {
      await adminService.updatePersonalStatus(userId, status)
      setPersonals(prev => prev.map(p => p.userId === userId ? { ...p, status } : p))
      toast.success('Status atualizado')
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = personals.filter(p => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Personals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie os profissionais da plataforma.</p>
      </div>

      <Input
        placeholder="Buscar por nome ou usuário..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm font-medium text-foreground">Nenhum personal encontrado</p>
          {search && <p className="text-xs text-muted-foreground">Tente outro termo de busca.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => {
            const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.INACTIVE
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                </div>
                <Badge variant="secondary" className="hidden sm:flex">
                  {p.studentCount} aluno{p.studentCount !== 1 ? 's' : ''}
                </Badge>
                <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={updating === p.userId}>
                      {updating === p.userId ? '...' : '⋯'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p.userId, 'ACTIVE')}
                      disabled={p.status === 'ACTIVE'}
                    >
                      Ativar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p.userId, 'INACTIVE')}
                      disabled={p.status === 'INACTIVE'}
                    >
                      Desativar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(p.userId, 'BLOCKED')}
                      disabled={p.status === 'BLOCKED'}
                      className="text-destructive focus:text-destructive"
                    >
                      Bloquear
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
