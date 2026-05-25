/**
 * INTEGRATION EXAMPLE: Agendamento Detail Page with Skeletons
 * =============================================================
 *
 * This example shows how to replace the simple loading spinner
 * in the agendamento detail page with structured skeleton loaders.
 */

import { useState, useEffect } from 'react'
import {
  SkeletonMobileHeader,
  SkeletonListCard,
  SkeletonMetricCard,
  SkeletonTableCard,
  SkeletonBottomNav,
} from '@/components/skeleton'

/**
 * BEFORE: Simple loading spinner (original implementation)
 */
function LoadingSpinnerExample() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#e8327b]/20 border-t-[#e8327b] rounded-full animate-spin" />
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#bf185d]/40 rounded-full animate-spin"
          style={{
            animationDirection: 'reverse',
            animationDuration: '1.5s',
          }}
        />
      </div>
    </div>
  )
}

/**
 * AFTER: Structured skeleton loading (new implementation)
 *
 * This skeleton matches the actual page structure:
 * - Header with back button and title
 * - Profile card with gradient background
 * - Info cards (Pet, Client, Service, Price)
 * - Notes section
 * - Action buttons
 */
function AgendamentoDetailSkeleton() {
  return (
    <div className="min-h-dvh bg-transparent relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#e8327b]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#bf185d]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#006c73]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <SkeletonMobileHeader showActions actionCount={2} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 py-6 space-y-4 relative z-10 max-w-7xl mx-auto">
        {/* Profile Card Skeleton */}
        <div className="p-6 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10">
          {/* Gradient header placeholder */}
          <div className="h-32 rounded-t-2xl bg-gradient-to-br from-[#e8327b]/20 via-[#bf185d]/15 to-[#006c73]/20 mb-4" />

          {/* Center icon skeleton */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-28 h-28 rounded-full bg-[#2b2041]/40 border-4 border-[#e8327b]/20 animate-pulse relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#e8327b]/30 via-[#bf185d]/20 to-[#006c73]/30 animate-pulse" />
            </div>
          </div>

          {/* Title and badge skeletons */}
          <div className="text-center space-y-3">
            <div className="h-10 w-48 mx-auto bg-[#2b2041]/40 rounded-lg animate-pulse" />
            <div className="h-7 w-32 mx-auto bg-[#2b2041]/40 rounded-lg animate-pulse" />
            <div className="h-6 w-24 mx-auto bg-[#2b2041]/40 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Pet Card */}
          <SkeletonListCard showAvatar showBadge showAction={false} />
          {/* Client Card */}
          <SkeletonListCard showAvatar showAction={false} />
          {/* Service Card */}
          <SkeletonListCard showAvatar={false} showAction={false} />
          {/* Price Card */}
          <SkeletonListCard showAvatar={false} showAction={false} />
        </div>

        {/* Notes Section */}
        <div className="p-4 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2b2041]/40 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-[#2b2041]/40 rounded animate-pulse" />
              <div className="h-16 w-full bg-[#2b2041]/40 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Package Card */}
        <SkeletonTableCard />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 rounded-2xl bg-[#2b2041]/40 animate-pulse" />
          <div className="h-14 rounded-2xl bg-[#2b2041]/40 animate-pulse" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <SkeletonBottomNav />
    </div>
  )
}

/**
 * USAGE: Replace the loading state in your page component
 *
 * OLD CODE:
 * ```tsx
 * if (loading) {
 *   return (
 *     <AppLayout>
 *       <LoadingSpinnerExample />
 *     </AppLayout>
 *   )
 * }
 * ```
 *
 * NEW CODE:
 * ```tsx
 * if (loading) {
 *   return (
 *     <AppLayout>
 *       <AgendamentoDetailSkeleton />
 *     </AppLayout>
 *   )
 * }
 * ```
 */

export {
  LoadingSpinnerExample,
  AgendamentoDetailSkeleton,
}
