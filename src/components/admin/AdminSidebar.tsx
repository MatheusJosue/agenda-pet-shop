'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Building, Ticket, LogOut, X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/empresas', icon: Building, label: 'Empresas' },
  { href: '/admin/convites', icon: Ticket, label: 'Convites' },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    const { logout } = await import('@/lib/actions/auth')
    await logout()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-purple-200/50 dark:border-purple-900/50 z-40">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-900/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex items-center justify-between border-b border-purple-200/50 dark:border-purple-900/50">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                          : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
