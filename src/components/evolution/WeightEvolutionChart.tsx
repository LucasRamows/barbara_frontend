import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BodyMeasurement } from '@/types/evolution.types'

export function WeightEvolutionChart({ measurements }: { measurements: BodyMeasurement[] }) {
  const data = [...measurements]
    .filter((measurement) => measurement.weight != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((measurement) => ({ date: format(new Date(measurement.date), 'MMM yy', { locale: ptBR }), peso: measurement.weight }))
  if (data.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={['auto', 'auto']} />
        <Tooltip formatter={(value: number) => [`${value} kg`, 'Peso']} />
        <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
