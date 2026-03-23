'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { DesktopHeader } from './desktop-header'

interface AppLayoutProps {
  children: ReactNode
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

export function AppLayout({ children, companyName, user }: AppLayoutProps) {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden xl:flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DesktopHeader user={user} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout - render children directly (they contain AppHeader, etc.) */}
      <div className="xl:hidden">
        {children}
      </div>
    </>
  )
}
