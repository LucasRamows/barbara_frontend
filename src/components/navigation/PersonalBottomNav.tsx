import { Dumbbell, Gift, Home, User, Users } from 'lucide-react'
import { BottomNav } from './BottomNav'

const tabs = [
  { to: '/personal', label: 'Início', Icon: Home },
  { to: '/personal/alunos', label: 'Alunos', Icon: Users },
  { to: '/personal/treinos', label: 'Treinos', Icon: Dumbbell },
  { to: '/personal/gifts', label: 'Gifts', Icon: Gift },
  { to: '/personal/perfil', label: 'Perfil', Icon: User },
]

export function PersonalBottomNav() {
  return <BottomNav tabs={tabs} />
}
