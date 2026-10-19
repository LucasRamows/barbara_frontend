import { Dumbbell, Gift, Home, User, Users } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import type { NavItem } from './NavItems'

const items: NavItem[] = [
  { to: '/personal', label: 'Início', Icon: Home, end: true },
  { to: '/personal/alunos', label: 'Alunos', Icon: Users },
  { to: '/personal/treinos', label: 'Treinos', Icon: Dumbbell },
  { to: '/personal/gifts', label: 'Gifts', Icon: Gift },
  { to: '/personal/perfil', label: 'Perfil', Icon: User },
]

export function PersonalSidebar() {
  return <AppSidebar navItems={items} />
}
