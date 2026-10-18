import { useSession } from '@/contexts/SessionContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PersonalDashboard() {
  const { user } = useSession()

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Bem-vindo, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe seus alunos e treinos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Alunos ativos" value={0} />
        <StatCard title="Treinos hoje" value={0} />
        <StatCard title="Gifts pendentes" value={0} />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
