import { Gift, History, Home, TrendingUp, User } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import type { NavItem } from './NavItems'

const items: NavItem[] = [
  { to: '/', label: 'Hoje', Icon: Home, end: true },
  { to: '/historico', label: 'Histórico', Icon: History },
  { to: '/evolucao', label: 'Evolução', Icon: TrendingUp },
  { to: '/gifts', label: 'Gifts', Icon: Gift },
  { to: '/perfil', label: 'Perfil', Icon: User },
]

export function StudentSidebar() {
  return <AppSidebar navItems={items} />
}
