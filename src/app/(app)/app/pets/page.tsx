import { Suspense } from 'react'
import { PetsPageContent } from './page-client'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'

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
      <AppHeader
        companyName="Agenda Pet Shop"
        user={{}}
        title="Pets"
        subtitle="Carregando..."
        icon="🐾"
      />
      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-0 bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:overflow-auto overflow-y-auto">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
