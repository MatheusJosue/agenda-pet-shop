import { Skeleton } from './skeleton'
import cn from 'classnames'

/**
 * Skeleton for list item cards (clients, pets, etc.)
 * Structure: [Avatar] [Title + Details + Badge] [Arrow]
 */
export interface SkeletonListCardProps {
  className?: string
  showAvatar?: boolean
  lines?: 1 | 2 | 3
  showBadge?: boolean
  showAction?: boolean
}

export function SkeletonListCard({
  className,
  showAvatar = true,
  lines = 2,
  showBadge = true,
  showAction = true,
}: SkeletonListCardProps) {
  return (
    <div
      className={cn(
        // Match GlassCard styling
        'p-4 rounded-2xl border backdrop-blur-sm',
        'bg-[#2d1b4e]/30 border-white/10',
        'flex items-center gap-4',
        className
      )}
    >
      {/* Avatar section */}
      {showAvatar && (
        <Skeleton
          variant="circle"
          className="w-11 h-11 flex-shrink-0"
        />
      )}

      {/* Content section */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title line */}
        <Skeleton
          variant="default"
          className="h-4 w-3/4 max-w-[200px]"
        />
        {/* Detail lines */}
        {lines >= 2 && (
          <Skeleton
            variant="default"
            className="h-3.5 w-1/2 max-w-[150px]"
          />
        )}
        {lines >= 3 && (
          <Skeleton
            variant="default"
            className="h-3 w-1/3 max-w-[100px]"
          />
        )}
      </div>

      {/* Right section - badge or action */}
      {showBadge && (
        <Skeleton
          variant="rounded"
          className="w-14 h-5 flex-shrink-0"
        />
      )}

      {showAction && !showBadge && (
        <Skeleton
          variant="circle"
          className="w-5 h-5 flex-shrink-0"
        />
      )}
    </div>
  )
}

/**
 * Stack of multiple list card skeletons
 */
export interface SkeletonListStackProps {
  count?: number
  className?: string
  cardClassName?: string
}

export function SkeletonListStack({
  count = 5,
  className,
  cardClassName,
}: SkeletonListStackProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListCard key={i} className={cardClassName} />
      ))}
    </div>
  )
}
