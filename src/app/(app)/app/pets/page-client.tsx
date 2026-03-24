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
import { AnimatedIcon } from '@/components/ui/animated-icon'
import { motion } from 'framer-motion'
import { Dog, Cat, Dog as DogLarge, Plus, PawPrint, User } from 'lucide-react'
import type { PetWithClient } from '@/lib/types/pets'

const sizeLabels = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande'
}

const sizeIcons = {
  small: Cat,
  medium: Dog,
  large: DogLarge
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
      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:overflow-auto overflow-y-auto">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
          title="Pets"
          subtitle={`${pets?.length || 0} pet${pets?.length !== 1 ? 's' : ''}`}
          icon="🐾"
          action={
            <Link href="/app/pets/novo">
              <Button variant="primary" size="sm" className="rounded-full gap-1">
                <Plus size={16} />
                Novo
              </Button>
            </Link>
          }
        />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !pets || pets.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center text-3xl mb-6 mx-auto">
              🐾
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {clientId ? 'Este cliente não tem pets' : 'Nenhum pet cadastrado'}
            </h2>
            <p className="text-purple-200/60 mb-6">
              {clientId
                ? 'Adicione o primeiro pet deste cliente'
                : 'Comece adicionando seu primeiro pet'}
            </p>
            <Link href="/app/pets/novo">
              <Button variant="primary" size="lg" className="gap-2 shadow-lg shadow-purple-500/30">
                <Plus size={18} />
                Adicionar Pet
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.map((pet: PetWithClient, index) => {
              const SizeIcon = sizeIcons[pet.size]
              const sizeEmoji = pet.size === 'small' ? '🐱' : pet.size === 'medium' ? '🐕' : '🦮'
              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link href={`/app/pets/${pet.id}`}>
                    <GlassCard
                      variant="default"
                      className="p-6 hover:scale-[1.02] transition-all cursor-pointer h-full group hover:bg-white/[0.08]"
                    >
                      <div className="flex flex-col h-full">
                        <div className={`w-14 h-14 rounded-2xl ${pet.size === 'small' ? 'bg-gradient-to-br from-pink-500/30 to-fuchsia-500/30' : 'bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <span className="text-2xl">{sizeEmoji}</span>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1 truncate">
                          {pet.name}
                        </h3>
                        {pet.breed && (
                          <p className="text-purple-200/60 text-sm mb-3 truncate">{pet.breed}</p>
                        )}
                        <span className={`inline-block px-3 py-1.5 ${pet.size === 'small' ? 'bg-pink-500/20 text-pink-300' : 'bg-purple-500/20 text-purple-300'} text-xs rounded-full mb-4 self-start font-medium`}>
                          {sizeLabels[pet.size]}
                        </span>
                        <div className="mt-auto pt-3 border-t border-white/10 flex items-center gap-2 text-purple-200/60 text-sm">
                          <User size={14} />
                          <span className="truncate">{pet.client.name}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
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
