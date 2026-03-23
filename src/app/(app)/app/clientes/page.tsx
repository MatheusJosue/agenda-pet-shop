import { Suspense } from 'react'
import { ClientesPageContent } from './page-client'
import { AppHeader } from '@/components/layout/app-header'

export default function ClientesPage() {
  return (
    <Suspense fallback={<ClientesLoading />}>
      <ClientesPageContent />
    </Suspense>
  )
}

function ClientesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden pb-20">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <AppHeader
        companyName="Agenda Pet Shop"
        user={{}}
        title="Clientes"
        subtitle="Carregando..."
        icon="👥"
      />

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
