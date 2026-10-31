import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Users, Search, ChevronRight } from 'lucide-react'
import { studentsService } from '@/services/students/students.service'
import type { StudentProfile } from '@/types/student.types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/common/DatePicker'
import formatPhone from '@/lib/formatPhone'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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

const createSchema = z.object({
  username: z
    .string()
    .optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
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

type CreateFormValues = z.infer<typeof createSchema>

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function StudentCard({
  student,
  onView,
}: {
  student: StudentProfile
  onView: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initials(student.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
        <p className="truncate text-xs text-muted-foreground">@{student.user.username}</p>
      </div>
      <StatusBadge status={student.user.status} />
      <Button variant="ghost" size="icon" onClick={onView} aria-label="Ver ficha">
        <ChevronRight size={18} />
      </Button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  )
}

function CreateStudentSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateFormValues>,
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      sex: '',
      height: '',
      objective: '',
      experienceLevel: '',
      restrictions: '',
      observations: '',
    },
  })

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await studentsService.create({
        ...values,
        email: values.email || undefined,
        height: values.height ? Number(values.height) : undefined,
        phone: values.phone || undefined,
        birthDate: values.birthDate || undefined,
        sex: values.sex || undefined,
        objective: values.objective || undefined,
        experienceLevel: values.experienceLevel || undefined,
        restrictions: values.restrictions || undefined,
        observations: values.observations || undefined,
      })
      toast.success('Aluno cadastrado com sucesso')
      form.reset()
      onCreated()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar aluno'
      toast.error(msg)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Novo aluno</SheetTitle>
          <SheetDescription>Preencha os dados para cadastrar um novo aluno.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 pb-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="nome_do_aluno" {...field} />
                  </FormControl>
                  {!field.value && form.watch('name') && (
                    <p className="text-xs text-muted-foreground">
                      Será gerado a partir do nome: <strong>{form.watch('name').toLowerCase().trim().replace(/\s+/g, '_')}</strong>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha temporária *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do aluno" {...field} />
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
                    <Input type="email" placeholder="opcional" {...field} />
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
                    <Input
                      placeholder="(00) 00000-0000"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(formatPhone(event.target.value))}
                    />
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
                    <FormLabel>Data de nascimento</FormLabel>
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
                      <Input type="number" placeholder="170" {...field} />
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
                    <Textarea placeholder="Ex: Hipertrofia, emagrecimento..." rows={2} {...field} />
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
                  <FormLabel>Restrições / lesões</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Lesões, limitações..." rows={2} {...field} />
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
                    <Textarea placeholder="Informações adicionais..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Cadastrando...' : 'Cadastrar aluno'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default function PersonalStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const load = async () => {
    try {
      const data = await studentsService.list()
      setStudents(data)
    } catch {
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [students, search],
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Alunos</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          Novo aluno
        </Button>
      </div>

      {!loading && students.length > 0 && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={48} strokeWidth={1} />}
          title={search ? 'Nenhum resultado' : 'Nenhum aluno cadastrado ainda'}
          description={
            search
              ? 'Tente buscar com outro nome.'
              : 'Cadastre o primeiro aluno para começar.'
          }
          action={
            !search ? (
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                Adicionar o primeiro aluno
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              onView={() => navigate(`/personal/alunos/${s.id}`)}
            />
          ))}
        </div>
      )}

      <CreateStudentSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={load}
      />
    </div>
  )
}
