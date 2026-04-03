/**
 * AMETISTA PET PRO - Skeleton Loading System
 * ============================================
 *
 * Complete showcase of all skeleton components available.
 * Use this as reference when implementing loading states.
 *
 * FILE STRUCTURE:
 * ├── skeleton.tsx              - Base skeleton component
 * ├── skeleton-metric-card.tsx  - Dashboard stat cards
 * ├── skeleton-list-card.tsx    - Client/Pet list items
 * ├── skeleton-table-row.tsx    - Agenda table rows
 * ├── skeleton-header.tsx       - Headers, sidebar, nav
 * └── index.ts                  - Centralized exports
 */

import {
  // Base components
  Skeleton,
  SkeletonWrapper,
  // Dashboard cards
  SkeletonMetricCard,
  SkeletonMetricGrid,
  // List cards
  SkeletonListCard,
  SkeletonListStack,
  // Tables
  SkeletonTableRow,
  SkeletonTable,
  SkeletonTableCard,
  SkeletonTableGrid,
  // Headers
  SkeletonHeader,
  SkeletonSidebar,
  SkeletonBottomNav,
  SkeletonMobileHeader,
} from './index'

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Simple Loading State
// ================================
export function SimpleLoadingExample() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonWrapper label="Carregando...">
        <Skeleton className="h-32 w-full" />
      </SkeletonWrapper>
    </div>
  )
}

// Example 2: Dashboard Stats
// ===========================
export function DashboardStatsExample() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white/50 text-sm uppercase tracking-wider">
        Dashboard
      </h2>
      <SkeletonMetricGrid count={4} />
    </div>
  )
}

// Example 3: Client List
// ======================
export function ClientListExample() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonHeader />
      <SkeletonListStack count={6} />
      <SkeletonBottomNav />
    </div>
  )
}

// Example 4: Agenda Table
// ========================
export function AgendaTableExample() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonMobileHeader />
      <SkeletonTable rows={8} showHeader />
      <SkeletonBottomNav />
    </div>
  )
}

// Example 5: Agenda Grid Cards
// =============================
export function AgendaGridExample() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonMobileHeader showActions actionCount={2} />
      <SkeletonTableGrid count={6} />
      <SkeletonBottomNav />
    </div>
  )
}

// Example 6: Full Page Layout
// ============================
export function FullPageLayoutExample() {
  return (
    <div className="min-h-screen bg-[#120a21]">
      <div className="flex">
        {/* Desktop Sidebar */}
        <SkeletonSidebar />

        {/* Main Content */}
        <div className="flex-1">
          <SkeletonHeader />

          <main className="p-4 space-y-6">
            {/* Stats Section */}
            <section>
              <SkeletonMetricGrid count={4} />
            </section>

            {/* Recent Appointments */}
            <section>
              <h3 className="text-white/50 text-sm uppercase tracking-wider mb-3">
                Agendamentos Recentes
              </h3>
              <SkeletonTable rows={5} />
            </section>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <SkeletonBottomNav />
    </div>
  )
}

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

/**
 * HOW TO INTEGRATE SKELETONS INTO YOUR PAGES:
 *
 * Step 1: Import the needed components
 * ```tsx
 * import { SkeletonMetricGrid, SkeletonTable } from '@/components/skeleton'
 * ```
 *
 * Step 2: Add loading state to your component
 * ```tsx
 * const [loading, setLoading] = useState(true)
 *
 * if (loading) {
 *   return <SkeletonTable rows={5} />
 * }
 * ```
 *
 * Step 3: Replace content with skeleton during data fetch
 * ```tsx
 * useEffect(() => {
 *   async function loadData() {
 *     setLoading(true)
 *     await fetchData()
 *     setLoading(false)
 *   }
 *   loadData()
 * }, [])
 * ```
 *
 * Step 4: Match the skeleton structure to your actual content
 * - Use SkeletonMetricCard for dashboard stats
 * - Use SkeletonListCard for client/pet lists
 * - Use SkeletonTable for agenda views
 * - Use SkeletonHeader for page headers
 */

export {
  // Re-export for convenience
  Skeleton,
  SkeletonWrapper,
  SkeletonMetricCard,
  SkeletonMetricGrid,
  SkeletonListCard,
  SkeletonListStack,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonTableCard,
  SkeletonTableGrid,
  SkeletonHeader,
  SkeletonSidebar,
  SkeletonBottomNav,
  SkeletonMobileHeader,
}
