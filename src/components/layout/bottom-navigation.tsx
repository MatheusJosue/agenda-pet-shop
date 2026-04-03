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
    <nav className="flex xl:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Main navigation container with glassmorphism */}
      <div className="w-full mx-auto max-w-7xl">
        {/* Glassmorphism bar with top rounded corners */}
        <div className="relative mx-3 mb-2 bg-[#2b2041]/70 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f183ff]/5 to-transparent rounded-t-3xl pointer-events-none" />

          {/* Navigation items */}
          <div className="relative flex items-center justify-around h-[72px] px-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex-1 flex items-center justify-center"
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 ease-out relative group',
                      isActive
                        ? 'bg-[#f183ff]/15 scale-105'
                        : 'hover:bg-white/5 active:scale-95'
                    )}
                  >
                    {/* Active state glow effect */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-[#f183ff]/20 rounded-2xl blur-md -z-10 animate-[pulse-glow_2s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#f183ff]/10 to-transparent rounded-2xl -z-10" />
                      </>
                    )}

                    {/* Icon */}
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        'transition-all duration-300 relative z-10',
                        isActive
                          ? 'text-[#f183ff] drop-shadow-[0_0_12px_rgba(241,131,255,0.6)] scale-110'
                          : 'text-[#b2a6c4] group-hover:text-[#d4c8e0]'
                      )}
                    />

                    {/* Label */}
                    <span
                      className={cn(
                        'text-[11px] font-semibold tracking-wide transition-all duration-300 relative z-10',
                        isActive
                          ? 'text-[#f183ff] drop-shadow-[0_0_8px_rgba(241,131,255,0.4)]'
                          : 'text-[#b2a6c4] group-hover:text-[#d4c8e0]'
                      )}
                    >
                      {tab.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Bottom safe area indicator (optional visual detail) */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
      `}</style>
    </nav>
  )
}
