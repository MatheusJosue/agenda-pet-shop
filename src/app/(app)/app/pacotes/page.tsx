'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { Button } from '@/components/ui/button'
import { getExhaustedPackages } from '@/lib/actions/packages'
import { generateExhaustedPackageMessage } from '@/lib/utils/whatsapp'
import type { PetPackageWithRelations } from '@/lib/types/packages'
import { PawPrint, Calendar } from 'lucide-react'

export default function PacotesPage() {
  const [packages, setPackages] = useState<PetPackageWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getExhaustedPackages().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setPackages(result.data || [])
      }
      setLoading(false)
    })
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden pb-20">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
              📦
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Pacotes
              </h1>
              <p className="text-purple-200/60 text-sm">
                Pacotes com créditos esgotados
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <GlassCard variant="default" className="p-4 bg-red-500/20 border-red-500/50">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        ) : packages.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <PawPrint size={32} className="text-purple-300" />
            </div>
            <p className="text-purple-200/60">Nenhum pacote esgotado no momento</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <GlassCard
                key={pkg.id}
                variant="default"
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PawPrint size={20} className="text-purple-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{pkg.pet.name}</span>
                    </div>
                    <p className="text-sm text-purple-200/60 mb-1">{pkg.client.name}</p>
                    <div className="flex items-center gap-1 text-sm text-purple-200/40">
                      <Calendar size={14} />
                      <span>Venceu em {formatDate(pkg.expires_at)}</span>
                    </div>
                    <p className="text-xs text-purple-200/40 mt-1">{pkg.package_type.name}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <WhatsAppButton
                      phone={pkg.client.phone}
                      message={generateExhaustedPackageMessage(
                        pkg.client.name,
                        pkg.pet.name,
                        pkg.package_type.name
                      )}
                      size="sm"
                    />
                    <Link href={`/app/pets/${pkg.pet.id}`}>
                      <Button variant="secondary" size="sm">
                        Ver Pet
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
