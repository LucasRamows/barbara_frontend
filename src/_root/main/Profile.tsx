import { useSession } from '@/contexts/SessionContext'

export default function Profile() {
  const { user } = useSession()

  return (
    <div className="p-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.name}</p>
    </div>
  )
}
