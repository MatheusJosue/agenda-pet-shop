import { Suspense } from 'react'
import { ClientesPageContent } from './page-client'
import { AppLayout } from '@/components/layout/app-layout'

export default function ClientesPage() {
  return (
    <Suspense fallback={<ClientesLoading />}>
      <ClientesPageContent />
    </Suspense>
  )
}

function ClientesLoading() {
  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
