import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end?: boolean
}

interface NavItemsProps {
  items: NavItem[]
}

export function NavItems({ items }: NavItemsProps) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarGroup className="px-3 py-4">
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {items.map(({ to, label, Icon, end }) => {
            const isActive = end !== false && to === '/'
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(to + '/')

            return (
              <SidebarMenuItem key={to} className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? label : undefined}
                  isActive={isActive}
                  className="relative"
                >
                  <NavLink
                    to={to}
                    end={to === '/' || end === true}
                    aria-label={label}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 rounded-md bg-sidebar-primary"
                      />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className={cn(
                        'relative z-10 shrink-0',
                        isActive
                          ? 'text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground',
                      )}
                    />
                    {!isCollapsed && (
                      <span
                        className={cn(
                          'relative z-10 truncate',
                          isActive && 'font-medium text-sidebar-primary-foreground',
                        )}
                      >
                        {label}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
