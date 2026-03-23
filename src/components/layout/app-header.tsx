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
}

export function AppHeader({ companyName, user }: AppHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-purple-200/50
                         backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 max-w-lg mx-auto">
          {/* Left side - Menu button + Logo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-950/30"
            >
              <Menu size={24} />
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                             flex items-center justify-center shadow-lg shadow-purple-500/25">
                🐾
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  {companyName}
                </h1>
              </div>
            </div>
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
