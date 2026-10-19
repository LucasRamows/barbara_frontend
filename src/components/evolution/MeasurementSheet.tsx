import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { bodyMeasurementsService } from '@/services/body-measurements/body-measurements.service'
import type { BodyMeasurement } from '@/types/evolution.types'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  weight: z.coerce.number().positive().optional().or(z.literal('')),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  bodyFat: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  chest: z.coerce.number().positive().optional().or(z.literal('')),
  waist: z.coerce.number().positive().optional().or(z.literal('')),
  hips: z.coerce.number().positive().optional().or(z.literal('')),
  thigh: z.coerce.number().positive().optional().or(z.literal('')),
  arm: z.coerce.number().positive().optional().or(z.literal('')),
  neck: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  studentId: string
  open: boolean
  onClose: () => void
  onCreated: (m: BodyMeasurement) => void
}

export function MeasurementSheet({ studentId, open, onClose, onCreated }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: today, weight: '', height: '', bodyFat: '',
      chest: '', waist: '', hips: '', thigh: '', arm: '', neck: '', notes: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const toNum = (v: string | number | undefined) => (v !== '' && v != null ? Number(v) : null)
      const m = await bodyMeasurementsService.create({
        studentId,
        date: values.date,
        weight: toNum(values.weight as string | number | undefined),
        height: toNum(values.height as string | number | undefined),
        bodyFat: toNum(values.bodyFat as string | number | undefined),
        chest: toNum(values.chest as string | number | undefined),
        waist: toNum(values.waist as string | number | undefined),
        hips: toNum(values.hips as string | number | undefined),
        thigh: toNum(values.thigh as string | number | undefined),
        arm: toNum(values.arm as string | number | undefined),
        neck: toNum(values.neck as string | number | undefined),
        notes: values.notes || null,
      })
      toast.success('Medidas registradas com sucesso')
      form.reset({ date: today, weight: '', height: '', bodyFat: '', chest: '', waist: '', hips: '', thigh: '', arm: '', neck: '', notes: '' })
      onCreated(m)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao registrar medidas')
    }
  }

  const numField = (name: keyof FormValues, label: string) => (
    <FormField key={name} control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><Input type="number" inputMode="decimal" step="0.1" placeholder="—" {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Registrar medidas</SheetTitle>
          <SheetDescription>Todos os campos são opcionais, exceto a data.</SheetDescription>
        </SheetHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="mt-6 space-y-4 pb-6">
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Data *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              {numField('weight', 'Peso (kg)')}
              {numField('height', 'Altura (cm)')}
              {numField('bodyFat', '% Gordura')}
              {numField('chest', 'Peito (cm)')}
              {numField('waist', 'Cintura (cm)')}
              {numField('hips', 'Quadril (cm)')}
              {numField('thigh', 'Coxa (cm)')}
              {numField('arm', 'Braço (cm)')}
              {numField('neck', 'Pescoço (cm)')}
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Registrar medidas'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
