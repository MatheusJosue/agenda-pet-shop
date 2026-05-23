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
        'animate-pulse',
        'bg-[#ffe0ec]',
        'backdrop-blur-sm',
        'relative overflow-hidden',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/65 before:to-transparent',
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
        <p className="text-[#68797d] text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}
