import { Dumbbell } from 'lucide-react'
import { useSession } from '@/contexts/SessionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function StudentToday() {
  const { user } = useSession()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Dumbbell size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Nenhum treino configurado para hoje</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seu personal ainda não definiu o treino deste dia.
            </p>
          </div>
          <Button disabled className="w-full max-w-xs">
            Iniciar treino
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
