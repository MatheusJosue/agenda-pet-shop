'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getPets } from '@/lib/actions/pets'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { SIZE_LABELS, SIZE_COLORS } from '@/lib/types/service-prices'
import { Plus, PawPrint } from 'lucide-react'
import type { PetWithClient } from '@/lib/types/pets'

const SIZE_EMOJIS: Record<string, string> = {
  tiny: '🐭',
  small: '🐱',
  medium: '🐕',
  large: '🦮',
  giant: '🐕‍🦺'
}

export function PetsPageContent() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get('client')
  const [pets, setPets] = useState<PetWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import('@/lib/actions/app')
        const result = await getAppStats()
        if (result.data) {
          setCompanyName(result.data.companyName || 'Agenda Pet Shop')
          setUser(result.data.user)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadPets() {
      try {
        const { data } = await getPets(clientId || undefined)
        setPets(data || [])
      } catch (error) {
        console.error('Error loading pets:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPets()
  }, [clientId])

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="flex flex-col min-h-dvh relative overflow-hidden bg-[#120a21]">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        {/* Mobile Header */}
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 relative z-10 custom-scrollbar">
        {/* Page Header */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                <PawPrint className="w-6 h-6 text-[#f183ff]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Pets
                </h1>
                <p className="text-white/50 text-sm mt-0.5">
                  {pets?.length || 0} cadastrado{pets?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Link href="/app/pets/novo">
              <Button
                variant="primary"
                size="sm"
                className="gap-2 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </div>
        ) : !pets || pets.length === 0 ? (
          <GlassCard
            variant="elevated"
            className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/10 flex items-center justify-center border border-[#f183ff]/20">
                <PawPrint size={40} className="text-[#f183ff]/60" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-[#f183ff]/10 animate-ping" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {clientId ? 'Este cliente não tem pets' : 'Nenhum pet cadastrado'}
            </h2>
            <p className="text-white/50 mb-6">
              {clientId
                ? 'Adicione o primeiro pet deste cliente'
                : 'Comece adicionando seu primeiro pet'}
            </p>
            <Link href="/app/pets/novo">
              <Button
                variant="primary"
                size="lg"
                className="gap-2 bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
              >
                <Plus size={18} />
                Adicionar Pet
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {pets.map((pet: PetWithClient, index) => {
              const sizeEmoji = SIZE_EMOJIS[pet.size] || '🐾'
              return (
                <Link
                  key={pet.id}
                  href={clientId ? `/app/clientes/${clientId}/pets/${pet.id}` : `/app/pets/${pet.id}`}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                >
                  <GlassCard
                    variant="elevated"
                    className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full group"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f183ff]/30 to-[#d946ef]/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#f183ff]/40 transition-all duration-300 shadow-lg shadow-[#f183ff]/10 border border-[#f183ff]/20">
                        <span className="text-2xl">{sizeEmoji}</span>
                      </div>
                      <h3 className="font-semibold text-white text-lg mb-1 truncate group-hover:text-[#f183ff] transition-colors">
                        {pet.name}
                      </h3>
                      {pet.breed && (
                        <p className="text-white/60 text-sm mb-3 truncate">{pet.breed}</p>
                      )}
                      <span className={`inline-block px-3 py-1.5 ${SIZE_COLORS[pet.size]} text-xs rounded-lg mb-4 self-start font-medium border border-white/10`}>
                        {SIZE_LABELS[pet.size]}
                      </span>
                      <div className="mt-auto pt-3 border-t border-white/10">
                        <p className="text-white/50 text-sm truncate">
                          {pet.client.name}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
      </div>
    </AppLayout>
  )
}
