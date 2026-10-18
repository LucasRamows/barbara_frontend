import { Gift, History, Home, TrendingUp, User } from 'lucide-react'
import { BottomNav } from './BottomNav'

const tabs = [
  { to: '/', label: 'Hoje', Icon: Home },
  { to: '/historico', label: 'Histórico', Icon: History },
  { to: '/evolucao', label: 'Evolução', Icon: TrendingUp },
  { to: '/gifts', label: 'Gifts', Icon: Gift },
  { to: '/perfil', label: 'Perfil', Icon: User },
]

export function StudentBottomNav() {
  return <BottomNav tabs={tabs} />
}
