'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

interface DesktopHeaderProps {
  user: {
    name?: string
    email?: string
  }
}

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function DesktopHeader({ user }: DesktopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <header className="hidden xl:flex sticky top-0 z-40 h-16 w-full bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="flex-1 ml-64 flex items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/app"
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
        >
          Pet Shop
        </Link>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/30">
              {getInitials(user?.name)}
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-50"
                onClick={() => setDropdownOpen(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 z-[60] w-48 bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl overflow-hidden">
                <Link
                  href="/app/perfil"
                  className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={18} />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
