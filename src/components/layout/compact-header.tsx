import Link from 'next/link'
import { logout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { PawPrint, LogOut, ChevronLeft } from 'lucide-react'

interface CompactHeaderProps {
  title?: string
  subtitle?: string
  user?: {
    name?: string
    email?: string
  }
  showBackButton?: boolean
  backHref?: string
  action?: React.ReactNode
}

export function CompactHeader({
  title = 'Agenda Pet Shop',
  subtitle,
  user,
  showBackButton = false,
  backHref = '/app',
  action,
}: CompactHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(232,50,123,0.22)] backdrop-blur-xl bg-[#fff9fb]/90 supports-[backdrop-filter]:bg-[#fff9fb]/80">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 max-w-lg mx-auto">
        {/* Left side - Back button or Logo */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBackButton ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ffe0ec] hover:bg-[#ffb7d2] transition-all hover:scale-105 active:scale-95 flex-shrink-0 group"
            >
              <ChevronLeft
                size={20}
                className="text-[#006c73] group-hover:-translate-x-0.5 transition-transform"
              />
            </Link>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8327b] to-[#006c73] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#e8327b]/25">
                <PawPrint size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" />
            </div>
          )}

          {/* Title */}
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Action or User menu */}
        <div className="flex items-center gap-2">
          {action || (
            user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {user.name || user.email?.split('@')[0]}
                  </p>
                </div>
                <form action={logout}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-[#ffe0ec] hover:text-[#bf185d] transition-colors"
                  >
                    <LogOut size={18} />
                  </Button>
                </form>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  )
}
