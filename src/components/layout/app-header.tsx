'use client'

import { useState } from 'react'
import { Menu, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppDrawer } from './app-drawer'

interface AppHeaderProps {
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

export function AppHeader({ companyName, user }: AppHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="flex xl:hidden sticky top-0 z-30 w-full border-b border-white/10 backdrop-blur-md bg-gradient-to-br from-purple-950 via-fuchsia-950/30 to-zinc-950">
        <div className="flex items-center justify-between px-4 py-3 gap-3 w-full">
          {/* Left: Menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-white hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Menu size={24} />
          </Button>

          {/* Center: Company Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <span className="text-lg">🐾</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate text-center">
                {companyName}
              </h1>
            </div>
          </div>

          {/* Right: Notifications & Settings */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        companyName={companyName}
        user={user}
      />
    </>
  )
}
