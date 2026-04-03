'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { User, HelpCircle, LogOut, X, PawPrint, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

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

      {/* Drawer - opens from LEFT with V2 dark background */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#120a21] z-50 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
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

          {/* Company Info Header */}
          <div className="px-5 py-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/20">
                <PawPrint size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {companyName}
                </h2>
                <p className="text-white/50 text-sm">
                  Bem-vindo de volta! 👋
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="px-5 py-4">
            <GlassCard variant="elevated" className="p-4 bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 border-[#f183ff]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center text-white text-base font-bold shadow-lg shadow-[#f183ff]/20">
                  {getInitials(user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {user?.email || 'usuario@email.com'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f183ff]/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-[#f183ff]" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
              Conta
            </p>
            <ul className="space-y-1">
              {accountItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-[#f183ff]/10 transition-all text-sm font-medium group"
                  >
                    <item.icon size={18} className="group-hover:text-[#f183ff] transition-colors" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10 pb-24">
            <GlassCard variant="elevated" className="p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-300/80 hover:text-red-200 hover:bg-red-500/10 transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Sair da Conta</span>
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  )
}
