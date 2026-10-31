import { lazy, Suspense, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { BodyMeasurement, ProgressPhoto } from '@/types/evolution.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty'
import { Scale } from 'lucide-react'

const WeightEvolutionChart = lazy(() =>
  import('./WeightEvolutionChart').then((module) => ({ default: module.WeightEvolutionChart })),
)

function calcBmi(weight: number | null, height: number | null): string {
  if (!weight || !height) return '—'
  const bmi = weight / Math.pow(height / 100, 2)
  return bmi.toFixed(1)
}

function fmt(val: number | null): string {
  return val != null ? String(val) : '—'
}

function DetailSheet({
  m,
  open,
  onClose,
}: {
  m: BodyMeasurement
  open: boolean
  onClose: () => void
}) {
  const fields: { label: string; value: string }[] = [
    { label: 'Data', value: format(new Date(m.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) },
    { label: 'Peso', value: m.weight != null ? `${m.weight} kg` : '—' },
    { label: 'Altura', value: m.height != null ? `${m.height} cm` : '—' },
    { label: 'IMC', value: calcBmi(m.weight, m.height) },
    { label: '% Gordura', value: m.bodyFat != null ? `${m.bodyFat}%` : '—' },
    { label: 'Peito', value: m.chest != null ? `${m.chest} cm` : '—' },
    { label: 'Ombros', value: m.shoulders != null ? `${m.shoulders} cm` : '—' },
    { label: 'Abdômen', value: m.abdomen != null ? `${m.abdomen} cm` : '—' },
    { label: 'Cintura', value: m.waist != null ? `${m.waist} cm` : '—' },
    { label: 'Quadril', value: m.hips != null ? `${m.hips} cm` : '—' },
    { label: 'Braço direito', value: m.rightArm != null ? `${m.rightArm} cm` : '—' },
    { label: 'Braço esquerdo', value: m.leftArm != null ? `${m.leftArm} cm` : '—' },
    { label: 'Antebraço direito', value: m.rightForearm != null ? `${m.rightForearm} cm` : '—' },
    { label: 'Antebraço esquerdo', value: m.leftForearm != null ? `${m.leftForearm} cm` : '—' },
    { label: 'Coxa direita', value: m.rightThigh != null ? `${m.rightThigh} cm` : '—' },
    { label: 'Coxa esquerda', value: m.leftThigh != null ? `${m.leftThigh} cm` : '—' },
    { label: 'Panturrilha direita', value: m.rightCalf != null ? `${m.rightCalf} cm` : '—' },
    { label: 'Panturrilha esquerda', value: m.leftCalf != null ? `${m.leftCalf} cm` : '—' },
    { label: 'Pescoço', value: m.neck != null ? `${m.neck} cm` : '—' },
    { label: 'Rosto', value: m.face != null ? `${m.face} cm` : '—' },
    { label: 'Cabelo', value: m.hairLength != null ? `${m.hairLength} cm` : '—' },
  ]

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes da medição</SheetTitle>
        </SheetHeader>
        <div className="mt-6 grid grid-cols-2 gap-4 pb-6">
          {fields.map(f => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className="text-sm font-medium text-foreground">{f.value}</p>
            </div>
          ))}
          {m.notes && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Observações</p>
              <p className="text-sm text-foreground">{m.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface Props {
  measurements: BodyMeasurement[]
  loading: boolean
  photos?: ProgressPhoto[]
}

export function MeasurementsView({ measurements, loading, photos = [] }: Props) {
  const [selected, setSelected] = useState<BodyMeasurement | null>(null)

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  if (!measurements.length) {
    return (
      <EmptyState
        icon={<Scale size={48} strokeWidth={1} />}
        title="Nenhuma medida registrada"
        description="Solicite ao seu personal para registrar suas medidas."
      />
    )
  }

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const latest = sorted[0]
  const previous = sorted[1]
  const weightVariation =
    latest.weight != null && previous?.weight != null ? latest.weight - previous.weight : null
  const latestPhotos = photos.filter((photo) => photo.date.slice(0, 10) === latest.date.slice(0, 10))

  return (
    <div className="space-y-4">
      {/* Latest snapshot */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Última medição — {format(new Date(latest.date), "dd/MM/yyyy")}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {latestPhotos.length > 0 ? latestPhotos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={photo.signedUrl}
                  alt={`Evolução ${photo.position.toLowerCase()}`}
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-2 py-1.5 text-xs text-muted-foreground">
                  {photo.position === 'FRONT' ? 'Frente' : photo.position === 'BACK' ? 'Costas' : photo.position === 'LEFT' ? 'Lateral esquerda' : photo.position === 'RIGHT' ? 'Lateral direita' : 'Outra'}
                </figcaption>
              </figure>
            )) : (
              <div className="col-span-full flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 text-center text-xs text-muted-foreground">
                Esta evolução não possui imagem. As medidas continuam disponíveis abaixo.
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {latest.weight != null && (
              <div className="rounded-lg bg-primary/10 p-2 text-center">
                <p className="text-lg font-bold text-primary">{latest.weight}</p>
                <p className="text-[10px] text-muted-foreground">kg</p>
              </div>
            )}
            {latest.bodyFat != null && (
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="text-lg font-bold text-foreground">{latest.bodyFat}%</p>
                <p className="text-[10px] text-muted-foreground">gordura</p>
              </div>
            )}
            {latest.weight != null && latest.height != null && (
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="text-lg font-bold text-foreground">{calcBmi(latest.weight, latest.height)}</p>
                <p className="text-[10px] text-muted-foreground">IMC</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Variação desde a medição anterior:{' '}
            <strong className="text-foreground">
              {weightVariation == null ? '—' : `${weightVariation > 0 ? '+' : ''}${weightVariation.toFixed(1)} kg`}
            </strong>
          </p>
        </CardContent>
      </Card>

      {/* Weight chart */}
      {measurements.filter((measurement) => measurement.weight != null).length >= 2 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Evolução do peso</p>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <WeightEvolutionChart measurements={measurements} />
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* History table */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Publicações de evolução</p>
        <div className="flex flex-col gap-4">
          {sorted.map(m => (
            <Card
              key={m.id}
            >
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Evolução corporal</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(m.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(m)}>
                    Ver detalhes
                  </Button>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {photos.filter((photo) => photo.date.slice(0, 10) === m.date.slice(0, 10)).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.signedUrl}
                      alt={`Evolução ${photo.position.toLowerCase()}`}
                      className="aspect-[3/4] w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
                {photos.every((photo) => photo.date.slice(0, 10) !== m.date.slice(0, 10)) && (
                  <div className="mb-4 flex min-h-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                    Publicação sem imagem
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <span><strong className="text-foreground">{fmt(m.weight)}</strong> <span className="text-muted-foreground">kg</span></span>
                  <span><strong className="text-foreground">{fmt(m.bodyFat)}</strong> <span className="text-muted-foreground">% gordura</span></span>
                  <span><strong className="text-foreground">{fmt(m.chest)}</strong> <span className="text-muted-foreground">peito</span></span>
                  <span><strong className="text-foreground">{fmt(m.waist)}</strong> <span className="text-muted-foreground">cintura</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selected && (
        <DetailSheet m={selected} open onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
