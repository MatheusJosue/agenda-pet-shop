import { Suspense } from 'react'
import { PetsPageContent } from './page-client'
import { AppLayout } from '@/components/layout/app-layout'
import { SkeletonListStack, SkeletonHeader } from '@/components/skeleton'

export default function PetsPage() {
  return (
    <Suspense fallback={<PetsLoading />}>
      <PetsPageContent />
    </Suspense>
  )
}

function PetsLoading() {
  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
          <SkeletonHeader showLogo={false} showUser={false} titleWidth="w-32" />
          <SkeletonListStack count={8} />
        </div>
      </div>
    </AppLayout>
  )
}
