'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Users,
  Package,
  Scissors,
  Dog,
  UserCircle,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'agenda-pet-shop:sidebar-collapsed'

const mainNavItems = [
  { href: '/app', icon: Home, label: 'Início' },
  { href: '/app/agendamentos', icon: Calendar, label: 'Agenda' },
  { href: '/app/clientes', icon: Users, label: 'Clientes' },
  { href: '/app/pacotes', icon: Package, label: 'Pacotes' },
  { href: '/app/servicos', icon: Scissors, label: 'Serviços' },
  { href: '/app/pets', icon: Dog, label: 'Pets' },
]

const baseNavItems = [
  { href: '/app/perfil', icon: UserCircle, label: 'Perfil' },
  { href: '/app/ajuda', icon: HelpCircle, label: 'Ajuda' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      setCollapsed(saved === 'true')
    }
    setMounted(true)
  }, [])

  // Save to localStorage when collapsed state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    }
  }, [collapsed, mounted])

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const width = collapsed ? 'w-20' : 'w-64'

  return (
    <aside
      className={cn(
        'hidden xl:flex flex-col fixed left-0 top-0 bottom-0 bg-zinc-900/95 border-r border-zinc-800 transition-all duration-300 ease-in-out z-50',
        width
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
          <span className="text-lg">🐾</span>
        </div>
        {!collapsed && (
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent whitespace-nowrap">
            Pet Shop
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-zinc-800" />

        <ul className="space-y-1">
          {baseNavItems.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          {collapsed ? (
            <ChevronsRight size={22} />
          ) : (
            <>
              <ChevronsLeft size={22} />
              <span className="text-sm font-medium">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string
  icon: any
  label: string
  active: boolean
  collapsed: boolean
}) {
  return (
    <div className="group relative flex items-center">
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative',
          active
            ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border-l-4 border-purple-500 text-purple-400'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        {!collapsed && (
          <span className="text-sm font-medium">
            {label}
          </span>
        )}
      </Link>

      {/* Tooltip - only when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-800 text-zinc-200 text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] shadow-lg border border-zinc-700 pointer-events-none">
          {label}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-800" />
        </div>
      )}
    </div>
  )
}
