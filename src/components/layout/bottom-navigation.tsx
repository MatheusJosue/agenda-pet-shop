'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/app', icon: Home, label: 'Início' },
  { href: '/app/agendamentos', icon: Calendar, label: 'Agenda' },
  { href: '/app/clientes', icon: Users, label: 'Clientes' },
  { href: '/app/servicos', icon: Scissors, label: 'Serviços' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-purple-950 via-fuchsia-950/30 to-zinc-950 backdrop-blur-md border-t border-white/10 safe-area-inset-bottom">
      <div className="flex items-center w-full h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex items-center justify-center h-full"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-purple-200/60 hover:text-purple-200/80 hover:bg-white/5'
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'transition-colors',
                    isActive && 'drop-shadow-lg shadow-purple-500/30'
                  )}
                />
                <span className="text-[10px] font-medium">
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
