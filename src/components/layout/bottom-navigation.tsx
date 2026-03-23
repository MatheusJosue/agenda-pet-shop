'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Calendar,
  Users,
  Dog,
  Scissors,
  Package,
  ChevronLeft,
  LogOut,
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/app', icon: Home, label: 'Início' },
  { href: '/app/agendamentos', icon: Calendar, label: 'Agenda' },
  { href: '/app/clientes', icon: Users, label: 'Clientes' },
  { href: '/app/pacotes', icon: Package, label: 'Pacotes' },
  { href: '/app/servicos', icon: Scissors, label: 'Serviços' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  // Don't show on nested pages (detail pages, new pages, etc.)
  const shouldHide = pathname.match(/\/(novo|[a-f0-9-]{36})$/)
  if (shouldHide) return null

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-purple-200/50 dark:border-purple-900/50 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around h-16 sm:h-20 max-w-lg mx-auto px-2">
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link key={tab.href} href={tab.href} className="flex-1">
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 relative mx-1',
                  isActive
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl -z-10"
                  />
                )}

                {/* Animated dot indicator */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                      delay: index * 0.05,
                    }}
                    className="absolute -top-1 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                )}

                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                    rotate: { duration: 0.4 },
                  }}
                >
                  <Icon
                    size={22}
                    className={cn(
                      'transition-colors',
                      isActive
                        ? 'stroke-purple-600 dark:stroke-purple-400'
                        : 'stroke-current'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>

                <motion.span
                  className={cn(
                    'text-[10px] sm:text-xs font-medium truncate transition-all duration-300',
                    isActive ? 'font-semibold' : 'font-normal'
                  )}
                  animate={{ y: isActive ? 0 : 2 }}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}

// Export icons for use in other components
export const Icons = {
  Home,
  Calendar,
  Users,
  Dog,
  Scissors,
  ChevronLeft,
  LogOut,
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
}
