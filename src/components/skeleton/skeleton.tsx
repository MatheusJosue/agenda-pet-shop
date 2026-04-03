import cn from 'classnames'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'rounded'
}

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base skeleton styling - Ametista Pet Pro theme
        'animate-pulse',
        'bg-[#2b2041]/40',
        'backdrop-blur-sm',
        'relative overflow-hidden',
        // Shimmer effect overlay
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/5 before:to-transparent',
        'before:translate-x-[-100%] before:animate-[shimmer_1.5s_infinite]',
        // Variant styles
        variant === 'circle' && 'rounded-full',
        variant === 'rounded' && 'rounded-2xl',
        variant === 'default' && 'rounded-lg',
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton wrapper for consistent spacing and layout
 */
export interface SkeletonWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  center?: boolean
}

export function SkeletonWrapper({
  children,
  label,
  center = false,
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        center && 'flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      {label && (
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}
