// src/app/(app)/app/precos/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getServicePrices, updateServicePrices } from '@/lib/actions/service-prices'
import type { ServicePrice } from '@/lib/types/service-prices'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { PriceTable } from '@/components/admin/price-table'
import { EditPriceModal } from '@/components/admin/edit-price-modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { SizeCategory } from '@/lib/types/service-prices'

export default function PrecosPage() {
  const [prices, setPrices] = useState<ServicePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'avulso' | 'pacote'>('all')
  const [editingService, setEditingService] = useState<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
  } | null>(null)

  useEffect(() => {
    loadPrices()
  }, [filter])

  const loadPrices = async () => {
    setLoading(true)
    const result = await getServicePrices(filter)

    if (result.data) {
      setPrices(result.data)
    }

    setLoading(false)
  }

  const groupedPrices = prices.reduce((acc, price) => {
    const key = `${price.service_name}-${price.billing_type}`

    if (!acc[key]) {
      acc[key] = {
        serviceName: price.service_name,
        billingType: price.billing_type,
        prices: []
      }
    }

    acc[key].prices.push(price)
    return acc
  }, {} as Record<string, { serviceName: string; billingType: 'avulso' | 'pacote'; prices: ServicePrice[] }>)

  const handleSavePrices = async (updates: Array<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
    hairType?: 'PC' | 'PL'
    sizeCategory: SizeCategory
    price: number
  }>) => {
    const result = await updateServicePrices(updates)

    if (result.error) {
      alert('Erro ao salvar preços: ' + result.error)
    } else {
      await loadPrices()
    }
  }

  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <AppHeader companyName="Agenda Pet Shop" user={{}} />

      <div className="h-[calc(100dvh-60px-64px)] xl:h-auto bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative flex flex-col xl:block overflow-hidden xl:overflow-visible">
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Gerenciar Preços
              </h1>
            </div>

            <div className="mb-6">
              <Select
                id="filter"
                label="Filtrar por"
                value={filter}
                onChange={(value) => setFilter(value as 'all' | 'avulso' | 'pacote')}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'avulso', label: 'Avulso' },
                  { value: 'pacote', label: 'Pacote' }
                ]}
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-purple-200/70">
                Carregando preços...
              </div>
            ) : Object.keys(groupedPrices).length === 0 ? (
              <div className="text-center py-12 text-purple-200/70">
                Nenhum preço encontrado.
              </div>
            ) : (
              <div>
                {Object.values(groupedPrices).map((group) => (
                  <PriceTable
                    key={`${group.serviceName}-${group.billingType}`}
                    serviceName={group.serviceName}
                    billingType={group.billingType}
                    prices={group.prices}
                    onEdit={() => setEditingService({
                      serviceName: group.serviceName,
                      billingType: group.billingType
                    })}
                  />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Button variant="secondary" className="w-full">
                <Plus size={20} className="mr-2" />
                Adicionar Novo Serviço
              </Button>
            </div>
          </main>
        </div>

        <div className="xl:hidden">
          <BottomNavigation />
        </div>
      </div>

      {editingService && (
        <EditPriceModal
          serviceName={editingService.serviceName}
          billingType={editingService.billingType}
          currentPrices={groupedPrices[`${editingService.serviceName}-${editingService.billingType}`]?.prices || []}
          open={!!editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSavePrices}
        />
      )}
    </AppLayout>
  )
}
