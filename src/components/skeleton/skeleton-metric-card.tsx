import { Skeleton } from './skeleton'
import cn from 'classnames'

/**
 * Skeleton for MetricCard components
 * Used in dashboard statistics and summary cards
 */
export interface SkeletonMetricCardProps {
  className?: string
  showTrend?: boolean
}

export function SkeletonMetricCard({
  className,
  showTrend = true,
}: SkeletonMetricCardProps) {
  return (
    <div
      className={cn(
        // Match MetricCard base styling
        'p-6 rounded-2xl border backdrop-blur-sm',
        'bg-[#2d1b4e]/30 border-white/10',
        className
      )}
    >
      {/* Header section with icon and trend badge */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon circle */}
        <Skeleton
          variant="circle"
          className="w-6 h-6"
        />
        {/* Trend badge */}
        {showTrend && (
          <Skeleton
            variant="rounded"
            className="w-12 h-5"
          />
        )}
      </div>

      {/* Value skeleton */}
      <Skeleton
        variant="default"
        className="h-7 w-24 mb-2"
      />

      {/* Label skeleton */}
      <Skeleton
        variant="default"
        className="h-4 w-32"
      />
    </div>
  )
}

/**
 * Grid of multiple metric card skeletons
 */
export interface SkeletonMetricGridProps {
  count?: number
  className?: string
}

export function SkeletonMetricGrid({
  count = 4,
  className,
}: SkeletonMetricGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
  )
}
