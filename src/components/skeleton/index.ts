/**
 * Ametista Pet Pro - Skeleton Loading System
 *
 * A comprehensive skeleton loading system that matches the dark glassmorphism
 * aesthetic of the Ametista Pet Pro design system.
 *
 * Theme Colors:
 * - Background: #120a21 (ultra-dark purple/black)
 * - Skeleton: #2b2041/40 (deep purple with transparency)
 * - Effect: backdrop-blur-sm for glassmorphism consistency
 *
 * Usage:
 * ```tsx
 * import { SkeletonMetricCard, SkeletonListStack } from '@/components/skeleton'
 *
 * // Metric card for dashboard stats
 * <SkeletonMetricCard />
 *
 * // List stack for clients/pets
 * <SkeletonListStack count={5} />
 * ```
 */

// Base skeleton component
export {
  Skeleton,
  SkeletonWrapper,
  type SkeletonProps,
  type SkeletonWrapperProps,
} from './skeleton'

// Dashboard / Metric Cards
export {
  SkeletonMetricCard,
  SkeletonMetricGrid,
  type SkeletonMetricCardProps,
  type SkeletonMetricGridProps,
} from './skeleton-metric-card'

// List Cards (Clients, Pets, etc.)
export {
  SkeletonListCard,
  SkeletonListStack,
  type SkeletonListCardProps,
  type SkeletonListStackProps,
} from './skeleton-list-card'

// Tables / Agenda Grids
export {
  SkeletonTableRow,
  SkeletonTable,
  SkeletonTableCard,
  SkeletonTableGrid,
  type SkeletonTableRowProps,
  type SkeletonTableProps,
  type SkeletonTableCardProps,
  type SkeletonTableGridProps,
} from './skeleton-table-row'

// Headers & Navigation
export {
  SkeletonHeader,
  SkeletonSidebar,
  SkeletonBottomNav,
  SkeletonMobileHeader,
  type SkeletonHeaderProps,
  type SkeletonSidebarProps,
  type SkeletonBottomNavProps,
  type SkeletonMobileHeaderProps,
} from './skeleton-header'

// Forms & Inputs
export {
  SkeletonInput,
  SkeletonTextarea,
  SkeletonSelect,
  SkeletonFormSection,
  SkeletonCheckboxItem,
  SkeletonCheckboxGroup,
  SkeletonFormActions,
  SkeletonForm,
  type SkeletonInputProps,
  type SkeletonTextareaProps,
  type SkeletonSelectProps,
  type SkeletonFormSectionProps,
  type SkeletonCheckboxItemProps,
  type SkeletonCheckboxGroupProps,
  type SkeletonFormActionsProps,
  type SkeletonFormProps,
} from './skeleton-form'
