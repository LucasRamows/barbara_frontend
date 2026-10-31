/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'
import type { PhotoPosition, ProgressPhoto } from '@/types/evolution.types'
import { progressPhotosService } from '@/services/progress-photos/progress-photos.service'

const schema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  weight: z.coerce.number().positive().optional().or(z.literal('')),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  bodyFat: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  chest: z.coerce.number().positive().optional().or(z.literal('')),
  shoulders: z.coerce.number().positive().optional().or(z.literal('')),
  abdomen: z.coerce.number().positive().optional().or(z.literal('')),
  waist: z.coerce.number().positive().optional().or(z.literal('')),
  hips: z.coerce.number().positive().optional().or(z.literal('')),
  rightArm: z.coerce.number().positive().optional().or(z.literal('')),
  leftArm: z.coerce.number().positive().optional().or(z.literal('')),
  rightForearm: z.coerce.number().positive().optional().or(z.literal('')),
  leftForearm: z.coerce.number().positive().optional().or(z.literal('')),
  rightThigh: z.coerce.number().positive().optional().or(z.literal('')),
  leftThigh: z.coerce.number().positive().optional().or(z.literal('')),
  rightCalf: z.coerce.number().positive().optional().or(z.literal('')),
  leftCalf: z.coerce.number().positive().optional().or(z.literal('')),
  thigh: z.coerce.number().positive().optional().or(z.literal('')),
  arm: z.coerce.number().positive().optional().or(z.literal('')),
  neck: z.coerce.number().positive().optional().or(z.literal('')),
  face: z.coerce.number().positive().optional().or(z.literal('')),
  hairLength: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  studentId: string
  open: boolean
  onClose: () => void
  onCreated: (m: BodyMeasurement) => void
  onPhotosCreated?: (photos: ProgressPhoto[]) => void
}

const positionLabels: Record<PhotoPosition, string> = {
  FRONT: 'Frente',
  BACK: 'Costas',
  LEFT: 'Lateral esquerda',
  RIGHT: 'Lateral direita',
  OTHER: 'Outra',
}

interface SelectedPhoto {
  file: File
  preview: string
  position: PhotoPosition
}

export function MeasurementSheet({ studentId, open, onClose, onCreated, onPhotosCreated }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: today, weight: '', height: '', bodyFat: '',
      chest: '', shoulders: '', abdomen: '', waist: '', hips: '',
      rightArm: '', leftArm: '', rightForearm: '', leftForearm: '',
      rightThigh: '', leftThigh: '', rightCalf: '', leftCalf: '',
      thigh: '', arm: '', neck: '', face: '', hairLength: '', notes: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    let measurement: BodyMeasurement | undefined
    try {
      const toNum = (v: string | number | undefined) => (v !== '' && v != null ? Number(v) : null)
      const createdMeasurement = await bodyMeasurementsService.create({
        studentId,
        date: values.date,
        weight: toNum(values.weight as string | number | undefined),
        height: toNum(values.height as string | number | undefined),
        bodyFat: toNum(values.bodyFat as string | number | undefined),
        chest: toNum(values.chest as string | number | undefined),
        shoulders: toNum(values.shoulders as string | number | undefined),
        abdomen: toNum(values.abdomen as string | number | undefined),
        waist: toNum(values.waist as string | number | undefined),
        hips: toNum(values.hips as string | number | undefined),
        rightArm: toNum(values.rightArm as string | number | undefined),
        leftArm: toNum(values.leftArm as string | number | undefined),
        rightForearm: toNum(values.rightForearm as string | number | undefined),
        leftForearm: toNum(values.leftForearm as string | number | undefined),
        rightThigh: toNum(values.rightThigh as string | number | undefined),
        leftThigh: toNum(values.leftThigh as string | number | undefined),
        rightCalf: toNum(values.rightCalf as string | number | undefined),
        leftCalf: toNum(values.leftCalf as string | number | undefined),
        thigh: toNum(values.thigh as string | number | undefined),
        arm: toNum(values.arm as string | number | undefined),
        neck: toNum(values.neck as string | number | undefined),
        face: toNum(values.face as string | number | undefined),
        hairLength: toNum(values.hairLength as string | number | undefined),
        notes: values.notes || null,
      })
      measurement = createdMeasurement
      onCreated(createdMeasurement)
      const uploadedPhotos: ProgressPhoto[] = []
      for (const selectedPhoto of selectedPhotos) {
        uploadedPhotos.push(await progressPhotosService.upload(selectedPhoto.file, {
          studentId,
          date: values.date,
          position: selectedPhoto.position,
        }))
      }
      onPhotosCreated?.(uploadedPhotos)
      toast.success(uploadedPhotos.length ? 'Evolução registrada com fotos' : 'Medidas registradas com sucesso')
      form.reset({ date: today, weight: '', height: '', bodyFat: '', chest: '', shoulders: '', abdomen: '', waist: '', hips: '', rightArm: '', leftArm: '', rightForearm: '', leftForearm: '', rightThigh: '', leftThigh: '', rightCalf: '', leftCalf: '', thigh: '', arm: '', neck: '', face: '', hairLength: '', notes: '' })
      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview))
      setSelectedPhotos([])
      onClose()
    } catch (err: any) {
      if (measurement) {
        toast.error('Medidas salvas, mas não foi possível enviar todas as fotos. Tente novamente pela aba de fotos.')
        selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview))
        setSelectedPhotos([])
        onClose()
      } else {
        toast.error(err?.response?.data?.message || 'Erro ao registrar medidas')
      }
    }
  }

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file): SelectedPhoto => ({
        file,
        preview: URL.createObjectURL(file),
        position: 'FRONT',
      }))
    setSelectedPhotos((current) => [...current, ...next])
  }

  const removePhoto = (preview: string) => {
    URL.revokeObjectURL(preview)
    setSelectedPhotos((current) => current.filter((photo) => photo.preview !== preview))
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
          <SheetTitle>Registrar evolução</SheetTitle>
          <SheetDescription>Adicione fotos opcionais e registre as medidas na mesma publicação.</SheetDescription>
        </SheetHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="mt-6 space-y-4 pb-6">
            <section className="space-y-3 rounded-2xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Fotos da evolução</p>
                  <p className="text-xs text-muted-foreground">Você pode adicionar frente, costas e laterais.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mr-1.5 size-4" />
                  Adicionar fotos
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  addPhotos(event.target.files)
                  event.target.value = ''
                }}
              />
              {selectedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.preview} className="overflow-hidden rounded-xl border border-border bg-card">
                      <div className="relative">
                        <img src={photo.preview} alt="" className="aspect-[3/4] w-full object-cover" />
                        <button
                          type="button"
                          aria-label="Remover foto"
                          onClick={() => removePhoto(photo.preview)}
                          className="absolute right-1 top-1 rounded-full bg-foreground/80 p-1 text-background"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                      <select
                        value={photo.position}
                        onChange={(event) => setSelectedPhotos((current) => current.map((item) => item.preview === photo.preview ? { ...item, position: event.target.value as PhotoPosition } : item))}
                        className="w-full border-0 bg-card px-2 py-2 text-xs text-foreground outline-none"
                      >
                        {Object.entries(positionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-xs text-muted-foreground">
                  Sem foto: a publicação será salva somente com as medidas.
                </div>
              )}
            </section>
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Data *</FormLabel>
                <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              {numField('weight', 'Peso (kg)')}
              {numField('height', 'Altura (cm)')}
              {numField('bodyFat', '% Gordura')}
              {numField('shoulders', 'Ombros (cm)')}
              {numField('chest', 'Peito (cm)')}
              {numField('abdomen', 'Abdômen (cm)')}
              {numField('waist', 'Cintura (cm)')}
              {numField('hips', 'Quadril (cm)')}
              {numField('rightArm', 'Braço direito (cm)')}
              {numField('leftArm', 'Braço esquerdo (cm)')}
              {numField('rightForearm', 'Antebraço direito (cm)')}
              {numField('leftForearm', 'Antebraço esquerdo (cm)')}
              {numField('rightThigh', 'Coxa direita (cm)')}
              {numField('leftThigh', 'Coxa esquerda (cm)')}
              {numField('rightCalf', 'Panturrilha direita (cm)')}
              {numField('leftCalf', 'Panturrilha esquerda (cm)')}
              {numField('neck', 'Pescoço (cm)')}
              {numField('face', 'Rosto (cm)')}
              {numField('hairLength', 'Comprimento do cabelo (cm)')}
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
