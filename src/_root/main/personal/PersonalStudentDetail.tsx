/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, TrendingUp, AlertTriangle } from 'lucide-react'
import { studentsService, type UpdateStudentDto } from '@/services/students/students.service'
import { deloadsService } from '@/services/deloads/deloads.service'
import { loadProgressionService } from '@/services/load-progression/load-progression.service'
import { bodyMeasurementsService } from '@/services/body-measurements/body-measurements.service'
import { progressPhotosService } from '@/services/progress-photos/progress-photos.service'
import type { StudentProfile } from '@/types/student.types'
import type { DeloadPeriod, LoadSuggestion } from '@/types/session.types'
import type { BodyMeasurement, ProgressPhoto } from '@/types/evolution.types'
import { MeasurementsView } from '@/components/evolution/MeasurementsView'
import { PhotosView } from '@/components/evolution/PhotosView'
import { MeasurementSheet } from '@/components/evolution/MeasurementSheet'
import { PersonalWeeklySchedule } from '@/features/workout-schedule/components/PersonalWeeklySchedule'
import { PersonalWorkoutHistory } from '@/features/workout-schedule/components/PersonalWorkoutHistory'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/common/DatePicker'
import formatPhone from '@/lib/formatPhone'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const editSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.string().optional(),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  objective: z.string().optional(),
  experienceLevel: z.string().optional(),
  restrictions: z.string().optional(),
  observations: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function EditStudentSheet({
  student,
  open,
  onClose,
  onUpdated,
}: {
  student: StudentProfile
  open: boolean
  onClose: () => void
  onUpdated: (updated: StudentProfile) => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      name: student.name,
      email: student.email ?? '',
      phone: student.phone ?? '',
      birthDate: student.birthDate ? student.birthDate.slice(0, 10) : '',
      sex: student.sex ?? '',
      height: student.height ?? '',
      objective: student.objective ?? '',
      experienceLevel: student.experienceLevel ?? '',
      restrictions: student.restrictions ?? '',
      observations: student.observations ?? '',
    },
  })

  const onSubmit = async (values: EditFormValues) => {
    try {
      const dto: UpdateStudentDto = {
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        birthDate: values.birthDate || undefined,
        sex: values.sex || undefined,
        height: values.height ? Number(values.height) : undefined,
        objective: values.objective || undefined,
        experienceLevel: values.experienceLevel || undefined,
        restrictions: values.restrictions || undefined,
        observations: values.observations || undefined,
      }
      const updated = await studentsService.update(student.id, dto)
      toast.success('Perfil atualizado')
      onUpdated(updated)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao atualizar perfil')
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>Editar perfil</SheetTitle>
          <SheetDescription>Atualize os dados do aluno.</SheetDescription>
        </SheetHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="mt-6 space-y-4 pb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(formatPhone(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nascimento</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                        <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restrições</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

const deloadSchema = z.object({
  startDate: z.string().min(1, 'Data obrigatória'),
  endDate: z.string().min(1, 'Data obrigatória'),
  reductionPercent: z.coerce.number().min(1).max(100),
  reason: z.string().optional(),
  observations: z.string().optional(),
})
type DeloadFormValues = z.infer<typeof deloadSchema>

function DeloadSection({ studentId }: { studentId: string }) {
  const [activeDeload, setActiveDeload] = useState<DeloadPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<DeloadFormValues>({
    resolver: zodResolver(deloadSchema) as any,
    defaultValues: {
      startDate: '',
      endDate: '',
      reductionPercent: 20,
      reason: '',
      observations: '',
    },
  })

  const loadDeloads = async () => {
    try {
      const result = await deloadsService.getAll(studentId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list: DeloadPeriod[] = Array.isArray(result) ? result : (result as any)?.data ?? []
      setActiveDeload(list.find((d) => d.status === 'ACTIVE') ?? null)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeloads()
  }, [studentId])

  const handleCreate = async (values: DeloadFormValues) => {
    try {
      await deloadsService.create({ studentId, ...values })
      toast.success('Período de deload criado')
      setSheetOpen(false)
      form.reset()
      loadDeloads()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar deload')
    }
  }

  const handleEnd = async () => {
    if (!activeDeload) return
    try {
      await deloadsService.update(activeDeload.id, { status: 'COMPLETED' })
      toast.success('Deload encerrado')
      loadDeloads()
    } catch {
      toast.error('Erro ao encerrar deload')
    }
  }

  if (loading) return <Skeleton className="h-20 rounded-xl" />

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1.5">
        <AlertTriangle size={14} className="text-status-warning-emphasis" />
        Período de deload
      </p>
      {activeDeload ? (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">
                {new Date(activeDeload.startDate).toLocaleDateString('pt-BR')} →{' '}
                {new Date(activeDeload.endDate).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Redução de {activeDeload.reductionPercent}%
                {activeDeload.reason ? ` · ${activeDeload.reason}` : ''}
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  Encerrar
                </Button>
              }
              title="Encerrar deload"
              description="Confirmar encerramento antecipado do período de deload?"
              confirmLabel="Encerrar"
              onConfirm={handleEnd}
            />
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
          Cadastrar deload
        </Button>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>Cadastrar período de deload</SheetTitle>
            <SheetDescription>Configure um período de carga reduzida.</SheetDescription>
          </SheetHeader>
          <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(handleCreate as any)} className="mt-6 space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início *</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim *</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reductionPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redução de carga (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Criar deload'}
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LoadSuggestionsSection({ studentId }: { studentId: string }) {
  const [suggestions, setSuggestions] = useState<LoadSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const result = await loadProgressionService.getSuggestions({ studentId })
      const list: LoadSuggestion[] = result?.data ?? []
      setSuggestions(list.filter((s) => s.isAccepted === null))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [studentId])

  const handleRespond = async (id: string, accepted: boolean) => {
    try {
      await loadProgressionService.respond(id, accepted)
      toast.success(accepted ? 'Sugestão aprovada' : 'Sugestão rejeitada')
      setSuggestions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast.error('Erro ao responder sugestão')
    }
  }

  if (loading) return <Skeleton className="h-16 rounded-xl" />
  if (!suggestions.length) return null

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1.5">
        <TrendingUp size={14} className="text-primary" />
        Sugestões de progressão
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {s.exerciseName ?? 'Exercício'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.currentWeight} →{' '}
                    <strong className="text-primary">
                      {s.suggestedWeight} {s.weightUnit ?? 'kg'}
                    </strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {s.justification}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" className="h-8" onClick={() => handleRespond(s.id, true)}>
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => handleRespond(s.id, false)}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function PersonalStudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [measLoading, setMeasLoading] = useState(false)
  const [measSheetOpen, setMeasSheetOpen] = useState(false)
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [activeEvoTab, setActiveEvoTab] = useState<'medidas' | 'fotos'>('medidas')

  useEffect(() => {
    if (!id) return
    studentsService
      .get(id)
      .then((s) => {
        setStudent(s)
        setMeasLoading(true)
        setPhotosLoading(true)
        bodyMeasurementsService
          .getAll(s.id)
          .then(setMeasurements)
          .catch(() => {})
          .finally(() => setMeasLoading(false))
        progressPhotosService
          .getAll(s.id)
          .then(setPhotos)
          .catch(() => {})
          .finally(() => setPhotosLoading(false))
      })
      .catch(() => toast.error('Aluno não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const handleResetPassword = async () => {
    if (!id || !newPassword) return
    setResetLoading(true)
    try {
      await studentsService.resetPassword(id, newPassword)
      toast.success('Senha redefinida com sucesso')
      setResetPwdOpen(false)
      setNewPassword('')
    } catch {
      toast.error('Erro ao redefinir senha')
    } finally {
      setResetLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!id || !student) return
    setStatusLoading(true)
    const newStatus = student.user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    try {
      await studentsService.updateStatus(id, newStatus)
      setStudent((prev) => (prev ? { ...prev, user: { ...prev.user, status: newStatus } } : prev))
      toast.success(newStatus === 'BLOCKED' ? 'Acesso bloqueado' : 'Acesso reativado')
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!id) return
    setArchiveLoading(true)
    try {
      await studentsService.remove(id)
      toast.success('Aluno arquivado')
      navigate('/personal/alunos')
    } catch {
      toast.error('Erro ao arquivar aluno')
    } finally {
      setArchiveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/personal/alunos')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-foreground">{student.name}</h1>
        </div>
        <StatusBadge status={student.user.status} />
      </div>

      <Tabs defaultValue="perfil">
        <TabsList className="w-full">
          <TabsTrigger value="perfil" className="flex-1 text-xs">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="treinos" className="flex-1 text-xs">
            Treinos
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex-1 text-xs">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="flex-1 text-xs">
            Evolução
          </TabsTrigger>
          <TabsTrigger value="config" className="flex-1 text-xs">
            Config.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-0">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 px-4 py-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">@{student.user.username}</p>
            </div>
          </div>

          <Separator />

          {/* Conta */}
          <div className="px-4 py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Conta
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuário</span>
                <span className="text-sm font-medium text-foreground">
                  @{student.user.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={student.user.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Início</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(student.startDate)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados pessoais */}
          <div className="px-4 py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dados pessoais
            </p>
            <div className="flex flex-col gap-4">
              {student.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">E-mail</span>
                  <span className="text-sm font-medium text-foreground">{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <span className="text-sm font-medium text-foreground">{student.phone}</span>
                </div>
              )}
              {student.birthDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nascimento</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(student.birthDate)}
                  </span>
                </div>
              )}
              {student.sex && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sexo</span>
                  <span className="text-sm font-medium text-foreground">{student.sex}</span>
                </div>
              )}
              {student.height && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Altura</span>
                  <span className="text-sm font-medium text-foreground">{student.height} cm</span>
                </div>
              )}
              {student.experienceLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nível</span>
                  <span className="text-sm font-medium text-foreground">
                    {student.experienceLevel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(student.objective || student.restrictions || student.observations) && (
            <>
              <Separator />
              <div className="px-4 py-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Objetivos e observações
                </p>
                <div className="flex flex-col gap-4">
                  {student.objective && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Objetivo</span>
                      <span className="text-sm text-foreground">{student.objective}</span>
                    </div>
                  )}
                  {student.restrictions && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Restrições</span>
                      <span className="text-sm text-foreground">{student.restrictions}</span>
                    </div>
                  )}
                  {student.observations && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Observações</span>
                      <span className="text-sm text-foreground">{student.observations}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="px-4 py-4">
            <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}>
              Editar perfil
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="treinos" className="mt-4 flex flex-col gap-4">
          <PersonalWeeklySchedule studentId={student.id} />
          <DeloadSection studentId={student.id} />
          <LoadSuggestionsSection studentId={student.id} />
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <PersonalWorkoutHistory studentId={student.id} />
        </TabsContent>

        <TabsContent value="evolucao" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setMeasSheetOpen(true)}
            >
              Registrar foto e medidas
            </Button>
            <button
              type="button"
              onClick={() => setActiveEvoTab('medidas')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeEvoTab === 'medidas'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Medidas
            </button>
            <button
              type="button"
              onClick={() => setActiveEvoTab('fotos')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeEvoTab === 'fotos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Fotos
            </button>
          </div>

          {activeEvoTab === 'medidas' && (
            <div className="space-y-3">
              <MeasurementsView measurements={measurements} photos={photos} loading={measLoading} />
            </div>
          )}

          {activeEvoTab === 'fotos' && student && (
            <div className="space-y-3">
              <PhotosView
                photos={photos}
                loading={photosLoading}
                onDelete={async (photoId) => {
                  try {
                    await progressPhotosService.remove(photoId)
                    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
                    toast.success('Foto removida')
                  } catch {
                    toast.error('Erro ao remover foto')
                  }
                }}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-4 space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setResetPwdOpen(true)}
              >
                Redefinir senha
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleStatus}
                disabled={statusLoading}
              >
                {statusLoading
                  ? 'Aguarde...'
                  : student.user.status === 'ACTIVE'
                  ? 'Bloquear acesso'
                  : 'Reativar acesso'}
              </Button>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    disabled={archiveLoading}
                  >
                    {archiveLoading ? 'Arquivando...' : 'Arquivar aluno'}
                  </Button>
                }
                title="Arquivar aluno"
                description="O aluno será desativado e não poderá mais acessar o sistema. Esta ação pode ser revertida."
                confirmLabel="Arquivar"
                onConfirm={handleArchive}
                destructive
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {student && (
        <EditStudentSheet
          student={student}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={setStudent}
        />
      )}

      {student && (
        <>
          <MeasurementSheet
            studentId={student.id}
            open={measSheetOpen}
            onClose={() => setMeasSheetOpen(false)}
            onCreated={(m) => setMeasurements((prev) => [m, ...prev])}
            onPhotosCreated={(createdPhotos) => setPhotos((prev) => [...createdPhotos, ...prev])}
          />
        </>
      )}

      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha temporária para {student.name}. O aluno deverá alterá-la no
              próximo acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              placeholder="Nova senha (mínimo 6 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
            <Button
              className="w-full"
              onClick={handleResetPassword}
              disabled={newPassword.length < 6 || resetLoading}
            >
              {resetLoading ? 'Salvando...' : 'Confirmar nova senha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
