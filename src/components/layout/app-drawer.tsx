'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { PawPrint, User, HelpCircle, LogOut, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

const menuItems = [
  { label: 'Pets', href: '/app/pets', icon: PawPrint },
]

const accountItems = [
  { label: 'Meu Perfil', href: '/app/perfil', icon: User },
  { label: 'Ajuda', href: '/app/ajuda', icon: HelpCircle },
]

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function AppDrawer({ isOpen, onClose, companyName, user }: AppDrawerProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
  }

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer - opens from LEFT */}
      <div
        className={`
          fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 z-50
          shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Company Info Header */}
          <div className="p-6 bg-gradient-to-br from-purple-500 to-fuchsia-500">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
                🐾
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {companyName}
                </h2>
                <p className="text-purple-100 text-sm truncate">
                  Painel de gestão
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Navigation */}
            {menuItems.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Navegação
                </p>
                <ul className="space-y-1 mb-6">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <button
                        onClick={() => navigate(item.href)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                 text-gray-700 dark:text-gray-300
                                 hover:bg-purple-50 dark:hover:bg-purple-950/30
                                 hover:text-purple-600 dark:hover:text-purple-400
                                 transition-all"
                      >
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                          <item.icon size={18} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Account */}
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
              Conta
            </p>
            <ul className="space-y-1 mb-6">
              {accountItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                             text-gray-700 dark:text-gray-300
                             hover:bg-purple-50 dark:hover:bg-purple-950/30
                             hover:text-purple-600 dark:hover:text-purple-400
                             transition-all"
                  >
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <item.icon size={18} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700
                       hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl py-3"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Sair da conta</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
