import { Skeleton } from './skeleton'
import cn from 'classnames'

/**
 * Skeleton for agenda table rows
 * Structure: [Time] [Service/Pet/Client] [Status Badge] [Actions]
 */
export interface SkeletonTableRowProps {
  className?: string
  showTime?: boolean
  showActions?: boolean
  compact?: boolean
}

export function SkeletonTableRow({
  className,
  showTime = true,
  showActions = true,
  compact = false,
}: SkeletonTableRowProps) {
  return (
    <div
      className={cn(
        // Match table row styling
        'flex items-center gap-3 py-3 px-4',
        'border-b border-white/5',
        'last:border-b-0',
        compact ? 'gap-2 py-2' : 'gap-3 py-3',
        className
      )}
    >
      {/* Time column */}
      {showTime && (
        <div className="flex-shrink-0 w-14">
          <Skeleton
            variant="rounded"
            className={cn('h-8 w-full', compact && 'h-6')}
          />
        </div>
      )}

      {/* Main content - Service, Pet, Client */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Service name */}
        <Skeleton
          variant="default"
          className={cn('h-4 w-2/3 max-w-[180px]', compact && 'h-3.5')}
        />
        {/* Pet and client info */}
        <div className="flex items-center gap-2">
          <Skeleton
            variant="circle"
            className={cn('w-4 h-4', compact && 'w-3 h-3')}
          />
          <Skeleton
            variant="default"
            className={cn('h-3 w-24', compact && 'h-2.5 w-20')}
          />
        </div>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0">
        <Skeleton
          variant="rounded"
          className={cn('w-16 h-6', compact && 'w-12 h-5')}
        />
      </div>

      {/* Action button */}
      {showActions && (
        <Skeleton
          variant="circle"
          className={cn('w-8 h-8 flex-shrink-0', compact && 'w-6 h-6')}
        />
      )}
    </div>
  )
}

/**
 * Full table skeleton with header and multiple rows
 */
export interface SkeletonTableProps {
  rows?: number
  showHeader?: boolean
  className?: string
  rowClassName?: string
}

export function SkeletonTable({
  rows = 5,
  showHeader = true,
  className,
  rowClassName,
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {/* Optional header */}
      {showHeader && (
        <div className="flex items-center gap-3 py-2 px-4 border-b border-white/10">
          <div className="flex-shrink-0 w-14">
            <Skeleton
              variant="rounded"
              className="h-4 w-full opacity-50"
            />
          </div>
          <div className="flex-1">
            <Skeleton
              variant="default"
              className="h-4 w-32 opacity-50"
            />
          </div>
          <div className="flex-shrink-0 w-16">
            <Skeleton
              variant="rounded"
              className="h-4 w-full opacity-50"
            />
          </div>
          <div className="flex-shrink-0 w-8" />
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} className={rowClassName} />
      ))}
    </div>
  )
}

/**
 * Grid card skeleton for alternative table view
 */
export interface SkeletonTableCardProps {
  className?: string
  showStatus?: boolean
}

export function SkeletonTableCard({
  className,
  showStatus = true,
}: SkeletonTableCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-2xl border backdrop-blur-sm',
        'bg-[#2d1b4e]/30 border-white/10',
        className
      )}
    >
      {/* Top row - Time and Status */}
      <div className="flex items-center justify-between mb-3">
        <Skeleton
          variant="rounded"
          className="h-7 w-14"
        />
        {showStatus && (
          <Skeleton
            variant="rounded"
            className="h-5 w-16"
          />
        )}
      </div>

      {/* Service name */}
      <Skeleton
        variant="default"
        className="h-5 w-3/4 mb-2"
      />

      {/* Pet info */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton
          variant="circle"
          className="w-5 h-5"
        />
        <Skeleton
          variant="default"
          className="h-3.5 w-24"
        />
      </div>

      {/* Client info */}
      <div className="flex items-center gap-2">
        <Skeleton
          variant="circle"
          className="w-4 h-4"
        />
        <Skeleton
          variant="default"
          className="h-3 w-28"
        />
      </div>
    </div>
  )
}

/**
 * Grid of table card skeletons
 */
export interface SkeletonTableGridProps {
  count?: number
  className?: string
  cardClassName?: string
}

export function SkeletonTableGrid({
  count = 6,
  className,
  cardClassName,
}: SkeletonTableGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTableCard key={i} className={cardClassName} />
      ))}
    </div>
  )
}
