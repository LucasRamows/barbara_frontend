import { LayoutDashboard, Settings, Target, User, Users } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import type { NavItem } from './NavItems'

const items: NavItem[] = [
  { to: '/admin', label: 'Visão geral', Icon: LayoutDashboard, end: true },
  { to: '/admin/personals', label: 'Personals', Icon: Users },
  { to: '/admin/criterios', label: 'Critérios', Icon: Target },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Settings },
  { to: '/admin/perfil', label: 'Perfil', Icon: User },
]

export function AdminSidebar() {
  return <AppSidebar navItems={items} />
}
