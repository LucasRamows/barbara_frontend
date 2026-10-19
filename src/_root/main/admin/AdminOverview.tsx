import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminService } from '@/services/admin/admin.service'
import { platformSettingsService } from '@/services/platform-settings/platform-settings.service'
import type { AdminStats } from '@/types/gifts.types'

function StatCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string
  value: React.ReactNode
  loading: boolean
  icon: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="font-display text-3xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminService.getStats(), platformSettingsService.getAll()])
      .then(([s, settings]) => {
        setStats(s)
        const mm = settings.find((p: { key: string }) => p.key === 'maintenanceMode')
        setMaintenanceMode(mm?.value === 'true' || false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">Indicadores administrativos da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Personals"
          value={stats?.totalPersonals ?? 0}
          loading={loading}
          icon="👤"
        />
        <StatCard
          title="Total de Alunos"
          value={stats?.totalStudents ?? 0}
          loading={loading}
          icon="🏋️"
        />
        <StatCard
          title="Sessões esta semana"
          value={stats?.sessionsThisWeek ?? 0}
          loading={loading}
          icon="📅"
        />
        <StatCard
          title="Total de sessões"
          value={stats?.totalSessions ?? 0}
          loading={loading}
          icon="📊"
        />
        <StatCard
          title="Sugestões pendentes"
          value={stats?.pendingSuggestions ?? 0}
          loading={loading}
          icon="💡"
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>🔧</span>
              Modo de manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : maintenanceMode ? (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Ativo
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Normal
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">Em breve: atividade recente da plataforma</p>
      </div>
    </div>
  )
}
