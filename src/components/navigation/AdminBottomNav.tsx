import { LayoutDashboard, Settings, Target, User, Users } from 'lucide-react'
import { BottomNav } from './BottomNav'

const tabs = [
  { to: '/admin', label: 'Visão geral', Icon: LayoutDashboard },
  { to: '/admin/personals', label: 'Personals', Icon: Users },
  { to: '/admin/criterios', label: 'Critérios', Icon: Target },
  { to: '/admin/configuracoes', label: 'Config', Icon: Settings },
  { to: '/admin/perfil', label: 'Perfil', Icon: User },
]

export function AdminBottomNav() {
  return <BottomNav tabs={tabs} />
}
