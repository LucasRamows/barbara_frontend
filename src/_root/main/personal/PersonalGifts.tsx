import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { giftsService } from '@/services/gifts/gifts.service'
import { rewardRulesService } from '@/services/reward-rules/reward-rules.service'
import { rewardAchievementsService } from '@/services/reward-achievements/reward-achievements.service'
import { studentsService } from '@/services/students/students.service'
import type { StudentProfile } from '@/types/student.types'
import type { Gift, RewardRule, RewardAchievement, RewardProgress, RewardRuleType } from '@/types/gifts.types'
import { RULE_TYPE_LABELS } from '@/types/gifts.types'

const RULE_TYPE_OPTIONS: { value: RewardRuleType; label: string }[] = [
  { value: 'SESSIONS_COUNT', label: 'Número de sessões' },
  { value: 'STREAK_WEEKS', label: 'Semanas consecutivas' },
  { value: 'WEIGHT_MILESTONE', label: 'Marco de carga (kg)' },
  { value: 'CONSISTENCY_PERCENT', label: 'Consistência (%)' },
  { value: 'CUSTOM', label: 'Personalizado' },
]

const TARGET_LABELS: Record<RewardRuleType, string> = {
  SESSIONS_COUNT: 'Sessões',
  STREAK_WEEKS: 'Semanas',
  WEIGHT_MILESTONE: 'Kg',
  CONSISTENCY_PERCENT: '%',
  CUSTOM: 'Valor',
}

// --- Gifts Tab ---
function GiftsTab() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingGifts, setLoadingGifts] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [delivering, setDelivering] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ studentId: '', title: '', description: '', imageUrl: '' })

  useEffect(() => {
    studentsService.list()
      .then(setStudents)
      .catch(() => toast.error('Erro ao carregar alunos'))
      .finally(() => setLoadingStudents(false))
  }, [])

  useEffect(() => {
    if (!selectedStudentId) return
    setLoadingGifts(true)
    giftsService.getAll(selectedStudentId)
      .then(setGifts)
      .catch(() => toast.error('Erro ao carregar presentes'))
      .finally(() => setLoadingGifts(false))
  }, [selectedStudentId])

  async function handleCreate() {
    if (!form.title.trim() || !form.studentId) {
      toast.error('Título e aluno são obrigatórios')
      return
    }
    setSubmitting(true)
    try {
      await giftsService.create({
        studentId: form.studentId,
        title: form.title,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
      })
      toast.success('Presente criado!')
      setSheetOpen(false)
      setForm({ studentId: '', title: '', description: '', imageUrl: '' })
      if (form.studentId === selectedStudentId) {
        const updated = await giftsService.getAll(selectedStudentId)
        setGifts(updated)
      }
    } catch {
      toast.error('Erro ao criar presente')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeliver(id: string) {
    setDelivering(id)
    try {
      const updated = await giftsService.deliver(id)
      setGifts(prev => prev.map(g => (g.id === id ? updated : g)))
      toast.success('Presente marcado como entregue!')
    } catch {
      toast.error('Erro ao marcar entrega')
    } finally {
      setDelivering(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await giftsService.remove(id)
      setGifts(prev => prev.filter(g => g.id !== id))
      toast.success('Presente excluído')
    } catch {
      toast.error('Erro ao excluir presente')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {loadingStudents ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={() => setSheetOpen(true)} disabled={!selectedStudentId}>
          Dar presente
        </Button>
      </div>

      {loadingGifts ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : selectedStudentId && gifts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum presente para este aluno ainda.
        </p>
      ) : (
        gifts.map(gift => (
          <Card key={gift.id}>
            <CardContent className="flex items-start gap-4 p-4">
              {gift.imageUrl && (
                <img src={gift.imageUrl} alt={gift.title} className="size-14 rounded-lg object-cover" loading="lazy" />
              )}
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-semibold text-foreground">{gift.title}</p>
                {gift.description && <p className="text-sm text-muted-foreground">{gift.description}</p>}
                <div className="mt-1">
                  {gift.isDelivered ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Entregue
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      A caminho
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!gift.isDelivered && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeliver(gift.id)}
                    disabled={delivering === gift.id}
                  >
                    {delivering === gift.id ? '...' : 'Entregar'}
                  </Button>
                )}
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Excluir
                    </Button>
                  }
                  title="Excluir presente"
                  description="Esta ação não pode ser desfeita."
                  confirmLabel="Excluir"
                  destructive
                  loading={deleting === gift.id}
                  onConfirm={() => handleDelete(gift.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dar presente</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label>Aluno *</Label>
              <Select
                value={form.studentId || selectedStudentId}
                onValueChange={v => setForm(f => ({ ...f, studentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Camiseta de treino"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detalhes do presente..."
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>URL da imagem</Label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="mt-2">
              {submitting ? 'Salvando...' : 'Criar presente'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// --- Rules Tab ---
function RulesTab() {
  const [rules, setRules] = useState<RewardRule[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'SESSIONS_COUNT' as RewardRuleType,
    targetValue: '',
    isActive: true,
  })

  useEffect(() => {
    rewardRulesService.getAll()
      .then(setRules)
      .catch(() => toast.error('Erro ao carregar regras'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!form.name.trim() || !form.targetValue) {
      toast.error('Nome e valor alvo são obrigatórios')
      return
    }
    setSubmitting(true)
    try {
      const created = await rewardRulesService.create({
        name: form.name,
        type: form.type,
        targetValue: Number(form.targetValue),
        description: form.description || undefined,
        isActive: form.isActive,
      })
      setRules(prev => [created, ...prev])
      toast.success('Regra criada!')
      setSheetOpen(false)
      setForm({ name: '', description: '', type: 'SESSIONS_COUNT', targetValue: '', isActive: true })
    } catch {
      toast.error('Erro ao criar regra')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(rule: RewardRule) {
    setToggling(rule.id)
    try {
      const updated = await rewardRulesService.update(rule.id, { isActive: !rule.isActive })
      setRules(prev => prev.map(r => (r.id === rule.id ? updated : r)))
    } catch {
      toast.error('Erro ao atualizar regra')
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    try {
      await rewardRulesService.remove(id)
      setRules(prev => prev.filter(r => r.id !== id))
      toast.success('Regra excluída')
    } catch {
      toast.error('Erro ao excluir regra')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setSheetOpen(true)}>Nova regra</Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : rules.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma regra criada ainda.
        </p>
      ) : (
        rules.map(rule => (
          <Card key={rule.id}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{rule.name}</p>
                  <Badge variant="secondary">{RULE_TYPE_LABELS[rule.type]}</Badge>
                  {!rule.isActive && <Badge variant="outline">Inativa</Badge>}
                </div>
                {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                <p className="text-xs text-muted-foreground">
                  Alvo: {rule.targetValue} {TARGET_LABELS[rule.type]}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(rule)}
                  disabled={toggling === rule.id}
                >
                  {rule.isActive ? 'Desativar' : 'Ativar'}
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Excluir
                    </Button>
                  }
                  title="Excluir regra"
                  description="Esta ação não pode ser desfeita."
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() => handleDelete(rule.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nova regra de conquista</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: 20 treinos concluídos"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={v => setForm(f => ({ ...f, type: v as RewardRuleType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{TARGET_LABELS[form.type]} alvo *</Label>
              <Input
                type="number"
                value={form.targetValue}
                onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))}
                placeholder="Ex: 20"
                min={1}
              />
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="mt-2">
              {submitting ? 'Salvando...' : 'Criar regra'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// --- Progress Tab ---
function ProgressTab() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [achievements, setAchievements] = useState<RewardAchievement[]>([])
  const [progress, setProgress] = useState<RewardProgress[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    studentsService.list()
      .then(setStudents)
      .catch(() => toast.error('Erro ao carregar alunos'))
      .finally(() => setLoadingStudents(false))
  }, [])

  async function loadProgress() {
    if (!selectedStudentId) return
    setLoadingProgress(true)
    try {
      const [a, p] = await Promise.all([
        rewardAchievementsService.getAchievements(selectedStudentId),
        rewardAchievementsService.getProgress(selectedStudentId),
      ])
      setAchievements(a)
      setProgress(p)
    } catch {
      toast.error('Erro ao carregar progresso')
    } finally {
      setLoadingProgress(false)
    }
  }

  useEffect(() => {
    if (selectedStudentId) loadProgress()
  }, [selectedStudentId])

  async function handleCheck() {
    if (!selectedStudentId) return
    setChecking(true)
    try {
      await rewardAchievementsService.check(selectedStudentId)
      await loadProgress()
      toast.success('Progresso verificado!')
    } catch {
      toast.error('Erro ao verificar progresso')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {loadingStudents ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleCheck}
          disabled={!selectedStudentId || checking}
        >
          {checking ? 'Verificando...' : 'Verificar'}
        </Button>
      </div>

      {loadingProgress ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : selectedStudentId ? (
        <div className="flex flex-col gap-4">
          {progress.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Progresso</h3>
              {progress.map(p => {
                const pct = Math.min(100, Math.round((p.currentValue / p.rule.targetValue) * 100))
                return (
                  <div key={p.id} className="rounded-xl border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{p.rule.name}</p>
                      {p.isComplete ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Conquistado!
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {p.currentValue} / {p.rule.targetValue}
                        </span>
                      )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {achievements.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Conquistas</h3>
              {achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                  <span className="text-xl">{a.status === 'PENDING' ? '🎉' : '✅'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.status === 'PENDING' ? 'Aguardando reconhecimento' : 'Reconhecida'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {progress.length === 0 && achievements.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum progresso registrado para este aluno.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}

// --- Main Component ---
export default function PersonalGifts() {
  return (
    <div className="flex flex-col gap-6 p-4 pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Gifts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie presentes e conquistas dos alunos.</p>
      </div>

      <Tabs defaultValue="presentes">
        <TabsList className="w-full">
          <TabsTrigger value="presentes" className="flex-1">Presentes</TabsTrigger>
          <TabsTrigger value="regras" className="flex-1">Regras</TabsTrigger>
          <TabsTrigger value="progresso" className="flex-1">Progresso</TabsTrigger>
        </TabsList>
        <TabsContent value="presentes" className="pt-4">
          <GiftsTab />
        </TabsContent>
        <TabsContent value="regras" className="pt-4">
          <RulesTab />
        </TabsContent>
        <TabsContent value="progresso" className="pt-4">
          <ProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
