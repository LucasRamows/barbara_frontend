import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { BodyMeasurement } from '@/types/evolution.types'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty'
import { Scale } from 'lucide-react'

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
    { label: 'Cintura', value: m.waist != null ? `${m.waist} cm` : '—' },
    { label: 'Quadril', value: m.hips != null ? `${m.hips} cm` : '—' },
    { label: 'Coxa', value: m.thigh != null ? `${m.thigh} cm` : '—' },
    { label: 'Braço', value: m.arm != null ? `${m.arm} cm` : '—' },
    { label: 'Pescoço', value: m.neck != null ? `${m.neck} cm` : '—' },
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
}

export function MeasurementsView({ measurements, loading }: Props) {
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

  const chartData = [...measurements]
    .filter(m => m.weight != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: format(new Date(m.date), 'MMM yy', { locale: ptBR }),
      peso: m.weight,
    }))

  return (
    <div className="space-y-4">
      {/* Latest snapshot */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Última medição — {format(new Date(latest.date), "dd/MM/yyyy")}
          </p>
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
        </CardContent>
      </Card>

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Evolução do peso</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v} kg`, 'Peso']}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--color-primary, #7660f9)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-primary, #7660f9)' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History table */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Histórico</p>
        <div className="flex flex-col gap-1">
          {sorted.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1 grid grid-cols-5 gap-2 text-sm">
                <span className="text-foreground font-medium">{format(new Date(m.date), 'dd/MM/yy')}</span>
                <span className="text-foreground">{fmt(m.weight)}</span>
                <span className="text-muted-foreground">{calcBmi(m.weight, m.height)}</span>
                <span className="text-muted-foreground">{m.bodyFat != null ? `${m.bodyFat}%` : '—'}</span>
                <span className="text-muted-foreground">{fmt(m.chest)}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-2 px-4 text-[10px] text-muted-foreground">
          <span>Data</span><span>Peso</span><span>IMC</span><span>Gord.</span><span>Peito</span>
        </div>
      </div>

      {selected && (
        <DetailSheet m={selected} open onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
