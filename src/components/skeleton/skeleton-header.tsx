import { Skeleton } from './skeleton'
import cn from 'classnames'

/**
 * Skeleton for app header bar
 * Structure: [Logo/Title] [Spacer] [User Actions]
 */
export interface SkeletonHeaderProps {
  className?: string
  showLogo?: boolean
  showUser?: boolean
  titleWidth?: string
}

export function SkeletonHeader({
  className,
  showLogo = true,
  showUser = true,
  titleWidth = 'w-32',
}: SkeletonHeaderProps) {
  return (
    <div
      className={cn(
        // Match header styling
        'flex items-center justify-between',
        'px-4 py-4',
        'bg-[#120a21]/80 backdrop-blur-xl',
        'border-b border-white/5',
        className
      )}
    >
      {/* Left section - Logo/Back button and Title */}
      <div className="flex items-center gap-3">
        {/* Back button or Logo */}
        {showLogo && (
          <Skeleton
            variant="circle"
            className="w-8 h-8"
          />
        )}
        {/* Title */}
        <Skeleton
          variant="default"
          className={cn('h-6', titleWidth)}
        />
      </div>

      {/* Right section - User avatar and actions */}
      {showUser && (
        <div className="flex items-center gap-2">
          <Skeleton
            variant="circle"
            className="w-8 h-8"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton for sidebar navigation
 * Structure: [Logo] [User Profile] [Nav Items]
 */
export interface SkeletonSidebarProps {
  className?: string
  itemCount?: number
  showUser?: boolean
  showLogo?: boolean
}

export function SkeletonSidebar({
  className,
  itemCount = 6,
  showUser = true,
  showLogo = true,
}: SkeletonSidebarProps) {
  return (
    <div
      className={cn(
        // Match sidebar styling
        'flex flex-col h-full',
        'w-64',
        'bg-[#120a21]/90 backdrop-blur-xl',
        'border-r border-white/5',
        'p-4 space-y-6',
        className
      )}
    >
      {/* Logo section */}
      {showLogo && (
        <div className="flex items-center gap-3 px-2">
          <Skeleton
            variant="circle"
            className="w-10 h-10"
          />
          <Skeleton
            variant="default"
            className="h-6 w-28"
          />
        </div>
      )}

      {/* User profile section */}
      {showUser && (
        <div className="flex items-center gap-3 p-3 rounded-xl">
          <Skeleton
            variant="circle"
            className="w-10 h-10"
          />
          <div className="flex-1 space-y-2">
            <Skeleton
              variant="default"
              className="h-4 w-24"
            />
            <Skeleton
              variant="default"
              className="h-3 w-32"
            />
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 space-y-1">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          >
            <Skeleton
              variant="circle"
              className="w-5 h-5"
            />
            <Skeleton
              variant="default"
              className="h-4 w-28"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for bottom navigation (mobile)
 * Structure: [Nav Items] centered horizontally
 */
export interface SkeletonBottomNavProps {
  className?: string
  itemCount?: number
}

export function SkeletonBottomNav({
  className,
  itemCount = 4,
}: SkeletonBottomNavProps) {
  return (
    <div
      className={cn(
        // Match bottom nav styling
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-center justify-around',
        'bg-[#120a21]/95 backdrop-blur-xl',
        'border-t border-white/5',
        'safe-area-inset-bottom',
        'px-2 py-2',
        className
      )}
    >
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 px-4 py-1"
        >
          <Skeleton
            variant="circle"
            className="w-6 h-6"
          />
          <Skeleton
            variant="default"
            className="h-2 w-10"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for mobile app header with back button
 */
export interface SkeletonMobileHeaderProps {
  className?: string
  showActions?: boolean
  actionCount?: number
}

export function SkeletonMobileHeader({
  className,
  showActions = true,
  actionCount = 2,
}: SkeletonMobileHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-50',
        'px-4 py-4',
        'bg-[#120a21]/80 backdrop-blur-xl',
        'border-b border-white/5',
        className
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Back button */}
        <Skeleton
          variant="circle"
          className="w-8 h-8"
        />

        {/* Center - Title */}
        <Skeleton
          variant="default"
          className="h-6 w-40"
        />

        {/* Right - Actions */}
        {showActions && (
          <div className="flex gap-1">
            {Array.from({ length: actionCount }).map((_, i) => (
              <Skeleton
                key={i}
                variant="circle"
                className="w-8 h-8"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
