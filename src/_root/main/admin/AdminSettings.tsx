import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { platformSettingsService } from '@/services/platform-settings/platform-settings.service'
import type { PlatformSetting } from '@/services/platform-settings/platform-settings.service'

interface SettingCardProps {
  title: string
  description: string
  children: React.ReactNode
  onSave: () => Promise<void>
  saving: boolean
}

function SettingCard({ title, description, children, onSave, saving }: SettingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {children}
        <Button onClick={onSave} disabled={saving} className="self-start" size="sm">
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  )
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function AdminSettings() {
  const [, setSettings] = useState<PlatformSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // Local values
  const [platformName, setPlatformName] = useState('')
  const [maxStudents, setMaxStudents] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowSelfReg, setAllowSelfReg] = useState(false)

  useEffect(() => {
    platformSettingsService.getAll()
      .then(data => {
        setSettings(data)
        const get = (key: string) => data.find((s: PlatformSetting) => s.key === key)?.value ?? ''
        setPlatformName(get('platformName') || 'Bárbara')
        setMaxStudents(get('maxStudentsPerPersonal') || '50')
        setMaintenanceMode(get('maintenanceMode') === 'true')
        setAllowSelfReg(get('allowSelfRegistration') === 'true')
      })
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  async function save(key: string, value: string) {
    setSaving(key)
    try {
      await platformSettingsService.upsert(key, value)
      setSettings(prev => {
        const exists = prev.find(s => s.key === key)
        if (exists) return prev.map(s => s.key === key ? { ...s, value } : s)
        return [...prev, { key, value, description: null, updatedAt: new Date().toISOString() }]
      })
      toast.success('Configuração salva')
    } catch {
      toast.error('Erro ao salvar configuração')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configurações gerais da plataforma.</p>
      </div>

      {maintenanceMode && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Modo de manutenção ativo
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              A plataforma está em manutenção. Usuários podem ter acesso restrito.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <SettingCard
          title="Nome da plataforma"
          description="Nome exibido na interface para todos os usuários."
          onSave={() => save('platformName', platformName)}
          saving={saving === 'platformName'}
        >
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
              placeholder="Bárbara"
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Limite de alunos por personal"
          description="Número máximo de alunos que cada personal pode cadastrar."
          onSave={() => save('maxStudentsPerPersonal', maxStudents)}
          saving={saving === 'maxStudentsPerPersonal'}
        >
          <div className="flex flex-col gap-2">
            <Label>Máximo de alunos</Label>
            <Input
              type="number"
              value={maxStudents}
              onChange={e => setMaxStudents(e.target.value)}
              min={1}
              max={1000}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Modo de manutenção"
          description="Quando ativo, a plataforma exibe aviso de manutenção."
          onSave={() => save('maintenanceMode', String(maintenanceMode))}
          saving={saving === 'maintenanceMode'}
        >
          <div className="flex items-center gap-3">
            <SwitchToggle checked={maintenanceMode} onChange={setMaintenanceMode} />
            <Label className="cursor-pointer" onClick={() => setMaintenanceMode(v => !v)}>
              {maintenanceMode ? 'Ativo' : 'Inativo'}
            </Label>
          </div>
        </SettingCard>

        <SettingCard
          title="Cadastro público"
          description="Permite que usuários se registrem sem convite de um personal."
          onSave={() => save('allowSelfRegistration', String(allowSelfReg))}
          saving={saving === 'allowSelfRegistration'}
        >
          <div className="flex items-center gap-3">
            <SwitchToggle checked={allowSelfReg} onChange={setAllowSelfReg} />
            <Label className="cursor-pointer" onClick={() => setAllowSelfReg(v => !v)}>
              {allowSelfReg ? 'Permitido' : 'Não permitido'}
            </Label>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
