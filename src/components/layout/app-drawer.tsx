'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { User, HelpCircle, LogOut, X } from 'lucide-react'
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

const menuItems: Array<{ label: string; href: string; icon: any }> = []

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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer - opens from LEFT with gradient background */}
      <div
        className={`
          fixed top-0 left-0 h-full w-[85%] max-w-sm
          bg-gradient-to-br from-purple-950 via-fuchsia-950 to-indigo-950 z-50
          shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-end p-4 border-b border-white/10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Company Info */}
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-xl">🐾</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {companyName}
                </h2>
                <p className="text-purple-200/60 text-sm">
                  Painel de gestão
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {accountItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                             text-purple-100/80
                             hover:bg-white/10
                             hover:text-white
                             transition-all text-sm"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-purple-200/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-purple-200/70
                       hover:bg-red-500/20 hover:text-red-300
                       transition-all text-sm font-medium"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
