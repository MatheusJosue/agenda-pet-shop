import { Skeleton } from './skeleton'
import cn from 'classnames'

/**
 * Skeleton for form input fields
 */
export interface SkeletonInputProps {
  className?: string
  label?: boolean
  width?: string
}

export function SkeletonInput({
  className,
  label = true,
  width = 'w-full',
}: SkeletonInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Skeleton
          variant="default"
          className="h-3.5 w-24"
        />
      )}
      <Skeleton
        variant="rounded"
        className={cn('h-10', width)}
      />
    </div>
  )
}

/**
 * Skeleton for form textarea fields
 */
export interface SkeletonTextareaProps {
  className?: string
  label?: boolean
  rows?: number
}

export function SkeletonTextarea({
  className,
  label = true,
  rows = 3,
}: SkeletonTextareaProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Skeleton
          variant="default"
          className="h-3.5 w-24"
        />
      )}
      <Skeleton
        variant="rounded"
        className="w-full"
        style={{ height: `${rows * 1.75}rem` }}
      />
    </div>
  )
}

/**
 * Skeleton for select dropdowns
 */
export interface SkeletonSelectProps extends SkeletonInputProps {}

export function SkeletonSelect(props: SkeletonSelectProps) {
  return <SkeletonInput {...props} />
}

/**
 * Skeleton for form section with multiple fields
 */
export interface SkeletonFormSectionProps {
  className?: string
  fieldCount?: number
  showTitle?: boolean
}

export function SkeletonFormSection({
  className,
  fieldCount = 4,
  showTitle = true,
}: SkeletonFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {showTitle && (
        <Skeleton
          variant="default"
          className="h-6 w-40 mb-2"
        />
      )}
      {Array.from({ length: fieldCount }).map((_, i) => (
        <SkeletonInput key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for checkbox/radio items
 */
export interface SkeletonCheckboxItemProps {
  className?: string
  showLabel?: boolean
}

export function SkeletonCheckboxItem({
  className,
  showLabel = true,
}: SkeletonCheckboxItemProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton
        variant="rounded"
        className="w-5 h-5 flex-shrink-0"
      />
      {showLabel && (
        <Skeleton
          variant="default"
          className="h-4 w-32"
        />
      )}
    </div>
  )
}

/**
 * Skeleton for checkbox group
 */
export interface SkeletonCheckboxGroupProps {
  className?: string
  count?: number
}

export function SkeletonCheckboxGroup({
  className,
  count = 3,
}: SkeletonCheckboxGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCheckboxItem key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for form actions (save/cancel buttons)
 */
export interface SkeletonFormActionsProps {
  className?: string
  buttonCount?: 1 | 2 | 3
}

export function SkeletonFormActions({
  className,
  buttonCount = 2,
}: SkeletonFormActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        buttonCount === 1 && 'justify-center',
        buttonCount === 2 && 'grid grid-cols-2',
        className
      )}
    >
      {Array.from({ length: buttonCount }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          className="h-10 w-full"
        />
      ))}
    </div>
  )
}

/**
 * Complete form skeleton with all elements
 */
export interface SkeletonFormProps {
  className?: string
  sections?: Array<{
    fieldCount: number
    showTitle: boolean
  }>
  showActions?: boolean
}

export function SkeletonForm({
  className,
  sections = [{ fieldCount: 4, showTitle: true }],
  showActions = true,
}: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {sections.map((section, i) => (
        <SkeletonFormSection
          key={i}
          fieldCount={section.fieldCount}
          showTitle={section.showTitle}
        />
      ))}
      {showActions && <SkeletonFormActions />}
    </div>
  )
}
