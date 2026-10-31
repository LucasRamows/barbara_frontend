/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Pencil,
  Dumbbell,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { workoutPlansService, type AddExerciseToDayDto, type UpdateWorkoutExerciseDto } from '@/services/workout-plans/workout-plans.service'
import { exercisesService, type CreateExerciseDto } from '@/services/exercises/exercises.service'
import type { WorkoutPlan, WorkoutPlanDay, WorkoutExercise, DayOfWeek } from '@/types/workout-plan.types'
import type { Exercise, MuscleGroup } from '@/types/exercise.types'
import { DAY_LABELS, ALL_DAYS } from '@/types/workout-plan.types'
import { MUSCLE_GROUP_LABELS } from '@/types/exercise.types'
import { MuscleGroupBadge } from '@/components/shared/MuscleGroupBadge'
import { EmptyState } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
import { cn } from '@/lib/utils'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  objective: z.string().optional(),
  estimatedMinutes: z.coerce.number().positive().optional().or(z.literal('')),
})

const exerciseConfigSchema = z.object({
  sets: z.coerce.number().int().min(1),
  minReps: z.coerce.number().int().min(1),
  maxReps: z.coerce.number().int().min(1),
  weight: z.coerce.number().nonnegative().optional().or(z.literal('')),
  weightUnit: z.enum(['KG', 'LB']),
  restSeconds: z.coerce.number().int().min(0),
  rpeTarget: z.coerce.number().int().min(1).max(10).optional().or(z.literal('')),
  notes: z.string().optional(),
  progressionEnabled: z.boolean(),
})

const exerciseFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  muscleGroup: z.string().min(1, 'Grupo muscular é obrigatório'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  isUnilateral: z.boolean().optional(),
  defaultSets: z.coerce.number().int().min(1).optional().or(z.literal('')),
  minReps: z.coerce.number().int().min(1).optional().or(z.literal('')),
  maxReps: z.coerce.number().int().min(1).optional().or(z.literal('')),
  defaultWeight: z.coerce.number().nonnegative().optional().or(z.literal('')),
  weightUnit: z.enum(['KG', 'LB']).optional(),
  restSeconds: z.coerce.number().int().min(0).optional().or(z.literal('')),
  progressionEnabled: z.boolean().optional(),
  suggestedIncrement: z.coerce.number().nonnegative().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type PlanFormValues = z.infer<typeof planSchema>
type ExerciseConfigValues = z.infer<typeof exerciseConfigSchema>
type ExerciseFormValues = z.infer<typeof exerciseFormSchema>

// ─── Sortable exercise row ────────────────────────────────────────────────────

function SortableExerciseRow({
  ex,
  onEdit,
  onRemove,
}: {
  ex: WorkoutExercise
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ex.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card p-3 touch-none',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-muted-foreground active:cursor-grabbing"
        aria-label="Arrastar"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{ex.exercise.name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {ex.sets}× {ex.minReps}–{ex.maxReps} reps
          </span>
          {ex.weight != null && ex.weight > 0 && (
            <span>
              · {ex.weight} {ex.weightUnit.toLowerCase()}
            </span>
          )}
          <MuscleGroupBadge group={ex.exercise.muscleGroup} />
        </div>
      </div>
      <button
        onClick={onEdit}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
        aria-label="Editar exercício"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onRemove}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
        aria-label="Remover exercício"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  onPickExercise,
  onEditExercise,
  onRemoveExercise,
  onReorder,
  onRemoveDay,
}: {
  day: WorkoutPlanDay
  onPickExercise: (day: WorkoutPlanDay) => void
  onEditExercise: (day: WorkoutPlanDay, ex: WorkoutExercise) => void
  onRemoveExercise: (day: WorkoutPlanDay, ex: WorkoutExercise) => void
  onReorder: (day: WorkoutPlanDay, items: WorkoutExercise[]) => void
  onRemoveDay: (day: WorkoutPlanDay) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = day.exercises.findIndex((e) => e.id === active.id)
    const newIdx = day.exercises.findIndex((e) => e.id === over.id)
    onReorder(day, arrayMove(day.exercises, oldIdx, newIdx))
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <p className="flex-1 text-sm font-semibold text-foreground">
          {DAY_LABELS[day.dayOfWeek]}
          {day.label && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">— {day.label}</span>
          )}
        </p>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
          aria-label={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        <button
          onClick={() => onRemoveDay(day)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive"
          aria-label="Remover dia"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {!collapsed && (
        <>
          <Separator />
          <div className="p-3 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={day.exercises.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {day.exercises.map((ex) => (
                  <SortableExerciseRow
                    key={ex.id}
                    ex={ex}
                    onEdit={() => onEditExercise(day, ex)}
                    onRemove={() => onRemoveExercise(day, ex)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {day.exercises.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nenhum exercício adicionado
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPickExercise(day)}
            >
              <Plus size={14} className="mr-1" /> Adicionar exercício
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── ExerciseFormSheet (create / edit exercise) ───────────────────────────────

function ExerciseFormSheet({
  open,
  onClose,
  onSaved,
  exercise,
}: {
  open: boolean
  onClose: () => void
  onSaved: (exercise: Exercise) => void
  exercise?: Exercise
}) {
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema) as any,
    defaultValues: exercise
      ? {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          description: exercise.description ?? '',
          instructions: exercise.instructions ?? '',
          isUnilateral: exercise.isUnilateral,
          defaultSets: exercise.defaultSets,
          minReps: exercise.minReps,
          maxReps: exercise.maxReps,
          defaultWeight: exercise.defaultWeight,
          weightUnit: exercise.weightUnit,
          restSeconds: exercise.restSeconds,
          progressionEnabled: exercise.progressionEnabled,
          suggestedIncrement: exercise.suggestedIncrement,
          notes: exercise.notes ?? '',
        }
      : {
          name: '',
          muscleGroup: '',
          weightUnit: 'KG',
          progressionEnabled: true,
          isUnilateral: false,
        },
  })

  useEffect(() => {
    if (!open) {
      setImages([])
      if (!exercise) form.reset({ weightUnit: 'KG', progressionEnabled: true, isUnilateral: false })
    }
  }, [open, exercise, form])

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  async function onSubmit(values: ExerciseFormValues) {
    setSaving(true)
    try {
      const dto: CreateExerciseDto = {
        name: values.name,
        muscleGroup: values.muscleGroup as MuscleGroup,
        description: values.description || undefined,
        instructions: values.instructions || undefined,
        isUnilateral: values.isUnilateral,
        defaultSets: values.defaultSets || undefined,
        minReps: values.minReps || undefined,
        maxReps: values.maxReps || undefined,
        defaultWeight: values.defaultWeight || undefined,
        weightUnit: values.weightUnit,
        restSeconds: values.restSeconds || undefined,
        progressionEnabled: values.progressionEnabled,
        suggestedIncrement: values.suggestedIncrement || undefined,
        notes: values.notes || undefined,
      }

      let saved: Exercise
      if (exercise) {
        saved = await exercisesService.update(exercise.id, dto)
      } else {
        saved = await exercisesService.create(dto)
      }

      for (const img of images) {
        await exercisesService.uploadImage(saved.id, img.file)
      }

      toast.success(exercise ? 'Exercício atualizado' : 'Exercício criado')
      onSaved(saved)
      onClose()
    } catch {
      toast.error('Erro ao salvar exercício')
    } finally {
      setSaving(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{exercise ? 'Editar exercício' : 'Novo exercício'}</SheetTitle>
          <SheetDescription>Preencha os campos abaixo.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl><Input {...field} placeholder="Ex: Supino reto" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="muscleGroup" render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo muscular *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((g) => (
                      <SelectItem key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="defaultSets" render={({ field }) => (
                <FormItem>
                  <FormLabel>Séries</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="minReps" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rep. mín.</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxReps" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rep. máx.</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="defaultWeight" render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga padrão</FormLabel>
                  <FormControl><Input type="number" min={0} step={0.5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weightUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KG">kg</SelectItem>
                      <SelectItem value="LB">lb</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="restSeconds" render={({ field }) => (
              <FormItem>
                <FormLabel>Descanso (segundos)</FormLabel>
                <FormControl><Input type="number" min={0} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="instructions" render={({ field }) => (
              <FormItem>
                <FormLabel>Instruções</FormLabel>
                <FormControl><Textarea {...field} rows={3} placeholder="Técnica de execução..." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Image upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Imagens demonstrativas</p>
              {images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img.preview} alt="" className="size-16 rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Plus size={14} className="mr-1" /> Adicionar imagem
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar exercício'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

// ─── ExercisePickerSheet ───────────────────────────────────────────────────────

function ExercisePickerSheet({
  open,
  onClose,
  onPick,
  onCreateNew,
}: {
  open: boolean
  onClose: () => void
  onPick: (exercise: Exercise) => void
  onCreateNew: () => void
}) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    exercisesService.list()
      .then(setExercises)
      .catch(() => toast.error('Erro ao carregar exercícios'))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = exercises.filter(
    (e) => e.isActive && e.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Selecionar exercício</SheetTitle>
          <SheetDescription>Escolha um exercício da sua biblioteca.</SheetDescription>
        </SheetHeader>
        <Input
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3"
        />
        <div className="mt-3 flex-1 overflow-y-auto space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={32} strokeWidth={1} />}
              title="Nenhum exercício encontrado"
              description="Crie um novo exercício abaixo."
            />
          ) : (
            filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onPick(ex)}
                className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left hover:bg-accent min-h-[44px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ex.name}</p>
                  <MuscleGroupBadge group={ex.muscleGroup} />
                </div>
              </button>
            ))
          )}
        </div>
        <Button variant="outline" className="mt-3" onClick={onCreateNew}>
          <Plus size={14} className="mr-1" /> Criar novo exercício
        </Button>
      </SheetContent>
    </Sheet>
  )
}

// ─── ExerciseConfigSheet ───────────────────────────────────────────────────────

function ExerciseConfigSheet({
  open,
  onClose,
  exercise,
  onSave,
}: {
  open: boolean
  onClose: () => void
  exercise: WorkoutExercise | null
  onSave: (values: UpdateWorkoutExerciseDto) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<ExerciseConfigValues>({
    resolver: zodResolver(exerciseConfigSchema) as any,
    defaultValues: {
      sets: 3,
      minReps: 8,
      maxReps: 12,
      weightUnit: 'KG',
      restSeconds: 60,
      progressionEnabled: true,
    },
  })

  useEffect(() => {
    if (exercise && open) {
      form.reset({
        sets: exercise.sets,
        minReps: exercise.minReps,
        maxReps: exercise.maxReps,
        weight: exercise.weight ?? '',
        weightUnit: exercise.weightUnit,
        restSeconds: exercise.restSeconds,
        rpeTarget: exercise.rpeTarget ?? '',
        notes: exercise.notes ?? '',
        progressionEnabled: exercise.progressionEnabled,
      })
    }
  }, [exercise, open, form])

  async function onSubmit(values: ExerciseConfigValues) {
    setSaving(true)
    try {
      await onSave({
        sets: values.sets,
        minReps: values.minReps,
        maxReps: values.maxReps,
        weight: values.weight || undefined,
        weightUnit: values.weightUnit,
        restSeconds: values.restSeconds,
        rpeTarget: values.rpeTarget || undefined,
        notes: values.notes || undefined,
        progressionEnabled: values.progressionEnabled,
      })
      toast.success('Exercício atualizado')
      onClose()
    } catch {
      toast.error('Erro ao atualizar exercício')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{exercise?.exercise.name ?? 'Configurar exercício'}</SheetTitle>
          <SheetDescription>Ajuste séries, repetições e carga.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="sets" render={({ field }) => (
                <FormItem>
                  <FormLabel>Séries</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="minReps" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mín.</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxReps" render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx.</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga</FormLabel>
                  <FormControl><Input type="number" min={0} step={0.5} placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weightUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KG">kg</SelectItem>
                      <SelectItem value="LB">lb</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="restSeconds" render={({ field }) => (
              <FormItem>
                <FormLabel>Descanso (s)</FormLabel>
                <FormControl><Input type="number" min={0} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rpeTarget" render={({ field }) => (
              <FormItem>
                <FormLabel>RPE alvo (1–10)</FormLabel>
                <FormControl><Input type="number" min={1} max={10} placeholder="Opcional" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Add Day Dialog ───────────────────────────────────────────────────────────

function AddDayDialog({
  open,
  onClose,
  existingDays,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  existingDays: DayOfWeek[]
  onAdd: (day: DayOfWeek, label: string) => Promise<void>
}) {
  const [selected, setSelected] = useState<DayOfWeek | ''>('')
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) { setSelected(''); setLabel('') }
  }, [open])

  const available = ALL_DAYS.filter((d) => !existingDays.includes(d))

  async function handle() {
    if (!selected) return
    setSaving(true)
    try {
      await onAdd(selected, label)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar dia</DialogTitle>
          <DialogDescription>Selecione o dia da semana para este treino.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {available.map((d) => (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={cn(
                  'rounded-lg border p-2 text-xs font-medium transition-colors min-h-[44px]',
                  selected === d
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-accent',
                )}
              >
                {DAY_LABELS[d].split('-')[0]}
              </button>
            ))}
            {available.length === 0 && (
              <p className="col-span-4 text-center text-sm text-muted-foreground py-2">
                Todos os dias já foram adicionados.
              </p>
            )}
          </div>
          {selected && (
            <Input
              placeholder="Rótulo do dia (Ex: Treino A)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          )}
          <Button className="w-full" disabled={!selected || saving} onClick={handle}>
            {saving ? 'Adicionando...' : 'Adicionar dia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Plan form section ────────────────────────────────────────────────────────

function PlanForm({
  plan,
  onSave,
}: {
  plan: WorkoutPlan | null
  onSave: (values: PlanFormValues) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: plan
      ? {
          name: plan.name,
          description: plan.description ?? '',
          objective: plan.objective ?? '',
          estimatedMinutes: plan.estimatedMinutes ?? '',
        }
      : { name: '', description: '', objective: '', estimatedMinutes: '' },
  })

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description ?? '',
        objective: plan.objective ?? '',
        estimatedMinutes: plan.estimatedMinutes ?? '',
      })
    }
  }, [plan, form])

  async function onSubmit(values: PlanFormValues) {
    setSaving(true)
    try {
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Dados da ficha</p>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Hipertrofia A" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl><Textarea {...field} rows={2} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="objective" render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo</FormLabel>
              <FormControl><Input {...field} placeholder="Ex: Hipertrofia" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="estimatedMinutes" render={({ field }) => (
            <FormItem>
              <FormLabel>Duração (min)</FormLabel>
              <FormControl><Input type="number" min={1} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Salvando...' : plan ? 'Salvar alterações' : 'Criar ficha'}
        </Button>
      </form>
    </Form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkoutPlanEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'novo' || !id

  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(!isNew)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [targetDay, setTargetDay] = useState<WorkoutPlanDay | null>(null)

  const [configOpen, setConfigOpen] = useState(false)
  const [configDay, setConfigDay] = useState<WorkoutPlanDay | null>(null)
  const [configExercise, setConfigExercise] = useState<WorkoutExercise | null>(null)

  const [exerciseFormOpen, setExerciseFormOpen] = useState(false)
  const [addDayOpen, setAddDayOpen] = useState(false)

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    workoutPlansService.get(id!)
      .then(setPlan)
      .catch(() => toast.error('Erro ao carregar ficha'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  async function handleSavePlan(values: PlanFormValues) {
    const dto = {
      name: values.name,
      description: values.description || undefined,
      objective: values.objective || undefined,
      estimatedMinutes: values.estimatedMinutes || undefined,
    }
    try {
      if (isNew) {
        const created = await workoutPlansService.create(dto)
        toast.success('Ficha criada')
        navigate(`/personal/treinos/${created.id}`, { replace: true })
      } else {
        const updated = await workoutPlansService.update(plan!.id, dto)
        setPlan(updated)
        toast.success('Ficha salva')
      }
    } catch {
      toast.error('Erro ao salvar ficha')
      throw new Error('save failed')
    }
  }

  async function handleAddDay(day: DayOfWeek, label: string) {
    if (!plan) return
    try {
      const newDay = await workoutPlansService.addDay(plan.id, { dayOfWeek: day, label: label || undefined })
      setPlan((prev) => prev ? { ...prev, days: [...prev.days, { ...newDay, exercises: [] }] } : prev)
      toast.success('Dia adicionado')
    } catch {
      toast.error('Erro ao adicionar dia')
      throw new Error('add day failed')
    }
  }

  async function handleRemoveDay(day: WorkoutPlanDay) {
    if (!plan) return
    try {
      await workoutPlansService.removeDay(plan.id, day.id)
      setPlan((prev) => prev ? { ...prev, days: prev.days.filter((d) => d.id !== day.id) } : prev)
      toast.success('Dia removido')
    } catch {
      toast.error('Erro ao remover dia')
    }
  }

  function handleOpenPicker(day: WorkoutPlanDay) {
    setTargetDay(day)
    setPickerOpen(true)
  }

  async function handlePickExercise(exercise: Exercise) {
    if (!plan || !targetDay) return
    setPickerOpen(false)
    try {
      const dto: AddExerciseToDayDto = {
        exerciseId: exercise.id,
        sets: exercise.defaultSets || 3,
        minReps: exercise.minReps || 8,
        maxReps: exercise.maxReps || 12,
        weight: exercise.defaultWeight,
        weightUnit: exercise.weightUnit,
        restSeconds: exercise.restSeconds || 60,
        progressionEnabled: exercise.progressionEnabled,
        order: targetDay.exercises.length,
      }
      const newEx = await workoutPlansService.addExercise(plan.id, targetDay.id, dto)
      setPlan((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.id === targetDay.id
              ? { ...d, exercises: [...d.exercises, { ...newEx, exercise }] }
              : d,
          ),
        }
      })
      toast.success('Exercício adicionado')
    } catch {
      toast.error('Erro ao adicionar exercício')
    }
  }

  function handleEditExercise(day: WorkoutPlanDay, ex: WorkoutExercise) {
    setConfigDay(day)
    setConfigExercise(ex)
    setConfigOpen(true)
  }

  async function handleSaveConfig(values: UpdateWorkoutExerciseDto) {
    if (!plan || !configDay || !configExercise) return
    const updated = await workoutPlansService.updateExercise(
      plan.id,
      configDay.id,
      configExercise.id,
      values,
    )
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.id === configDay.id
            ? {
                ...d,
                exercises: d.exercises.map((e) =>
                  e.id === configExercise.id ? { ...updated, exercise: e.exercise } : e,
                ),
              }
            : d,
        ),
      }
    })
  }

  async function handleRemoveExercise(day: WorkoutPlanDay, ex: WorkoutExercise) {
    if (!plan) return
    try {
      await workoutPlansService.removeExercise(plan.id, day.id, ex.id)
      setPlan((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.id === day.id ? { ...d, exercises: d.exercises.filter((e) => e.id !== ex.id) } : d,
          ),
        }
      })
      toast.success('Exercício removido')
    } catch {
      toast.error('Erro ao remover exercício')
    }
  }

  async function handleReorder(day: WorkoutPlanDay, reordered: WorkoutExercise[]) {
    if (!plan) return
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        days: prev.days.map((d) => (d.id === day.id ? { ...d, exercises: reordered } : d)),
      }
    })
    try {
      await workoutPlansService.reorderExercises(
        plan.id,
        day.id,
        reordered.map((e, i) => ({ id: e.id, order: i })),
      )
    } catch {
      toast.error('Erro ao reordenar exercícios')
    }
  }

  function handleExerciseCreated() {
    setExerciseFormOpen(false)
    setPickerOpen(true)
  }

  const sortedDays = plan
    ? [...plan.days].sort((a, b) => ALL_DAYS.indexOf(a.dayOfWeek) - ALL_DAYS.indexOf(b.dayOfWeek))
    : []

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/personal/treinos')}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-display text-xl font-bold text-foreground">
          {isNew ? 'Nova ficha' : (plan?.name ?? 'Ficha de treino')}
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Plan metadata form */}
          <PlanForm plan={plan} onSave={handleSavePlan} />

          {/* Days section — only shown after plan is created */}
          {plan && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Dias de treino</p>
                {sortedDays.length < 7 && (
                  <Button variant="outline" size="sm" onClick={() => setAddDayOpen(true)}>
                    <Plus size={14} className="mr-1" /> Dia
                  </Button>
                )}
              </div>

              {sortedDays.length === 0 ? (
                <EmptyState
                  icon={<Dumbbell size={36} strokeWidth={1} />}
                  title="Nenhum dia configurado"
                  description="Adicione dias de treino e exercícios."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setAddDayOpen(true)}>
                      <Plus size={14} className="mr-1" /> Adicionar dia
                    </Button>
                  }
                />
              ) : (
                sortedDays.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    onPickExercise={handleOpenPicker}
                    onEditExercise={handleEditExercise}
                    onRemoveExercise={handleRemoveExercise}
                    onReorder={handleReorder}
                    onRemoveDay={handleRemoveDay}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Sheets & Dialogs */}
      <AddDayDialog
        open={addDayOpen}
        onClose={() => setAddDayOpen(false)}
        existingDays={plan?.days.map((d) => d.dayOfWeek) ?? []}
        onAdd={handleAddDay}
      />

      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickExercise}
        onCreateNew={() => {
          setPickerOpen(false)
          setExerciseFormOpen(true)
        }}
      />

      <ExerciseFormSheet
        open={exerciseFormOpen}
        onClose={() => setExerciseFormOpen(false)}
        onSaved={handleExerciseCreated}
      />

      <ExerciseConfigSheet
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        exercise={configExercise}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
