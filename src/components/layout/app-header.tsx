'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppDrawer } from './app-drawer'

interface AppHeaderProps {
  companyName: string
  user: {
    name?: string
    email?: string
  }
  title?: string
  subtitle?: string
  icon?: string
  action?: React.ReactNode
}

export function AppHeader({ companyName, user, title, subtitle, icon = '🐾', action }: AppHeaderProps) {
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

          {/* Center: Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500
                           flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <span className="text-lg">{icon}</span>
            </div>
            <div className="min-w-0">
              {title && (
                <h1 className="text-base font-bold text-white truncate text-center">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-purple-200/60 text-sm truncate text-center">
                  {subtitle}
                </p>
              )}
              {!title && (
                <h1 className="text-base font-bold text-white truncate text-center">
                  {companyName}
                </h1>
              )}
            </div>
          </div>

          {/* Right: Action */}
          {action && <div className="flex-shrink-0">{action}</div>}
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
