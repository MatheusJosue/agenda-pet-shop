// src/components/appointments/service-selector.tsx
'use client'

import { useEffect, useState } from 'react'
import { ServiceCard } from './service-card'
import { getServicePrices } from '@/lib/actions/service-prices'
import type { ServicePrice, SizeCategory } from '@/lib/types/service-prices'

interface ServiceSelectorProps {
  petSize: SizeCategory
  billingType: 'avulso' | 'pacote'
  selectedServicePriceId?: string
  onServiceSelect: (servicePriceId: string, price: number, hairType: 'PC' | 'PL' | null) => void
}

interface GroupedService {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hasHairType: boolean
  pricesBySize: Record<SizeCategory, ServicePrice | null>
}

export function ServiceSelector({
  petSize,
  billingType,
  selectedServicePriceId,
  onServiceSelect
}: ServiceSelectorProps) {
  const [services, setServices] = useState<ServicePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [billingType])

  const loadServices = async () => {
    setLoading(true)
    setError(null)

    const result = await getServicePrices(billingType)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setServices(result.data)
    }

    setLoading(false)
  }

  // Group services by name and billing type
  const groupedServices: Record<string, GroupedService> = services.reduce((acc, price) => {
    const key = `${price.service_name}-${price.billing_type}`

    if (!acc[key]) {
      // Check if this service has hair types
      const hasHairType = services.some(
        s => s.service_name === price.service_name &&
             s.billing_type === price.billing_type &&
             s.hair_type !== null
      )

      acc[key] = {
        serviceName: price.service_name,
        billingType: price.billing_type,
        hasHairType,
        pricesBySize: {
          tiny: null,
          small: null,
          medium: null,
          large: null,
          giant: null
        }
      }
    }

    // Store price by size category
    acc[key].pricesBySize[price.size_category] = price

    return acc
  }, {} as Record<string, GroupedService>)

  if (loading) {
    return (
      <div className="text-center py-8 text-purple-200/70">
        Carregando serviços...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        {error}
      </div>
    )
  }

  if (Object.keys(groupedServices).length === 0) {
    return (
      <div className="text-center py-8 text-purple-200/70">
        Nenhum serviço encontrado para {billingType === 'avulso' ? 'avulso' : 'pacote'}.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-purple-100/90 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
          ✨
        </span>
        Serviços ({billingType === 'avulso' ? 'Avulso' : 'Pacote'}) *
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(groupedServices).map((group) => {
          const priceForPetSize = group.pricesBySize[petSize]

          if (!priceForPetSize) {
            return null
          }

          const isSelected = selectedServicePriceId === priceForPetSize.id

          return (
            <ServiceCard
              key={`${group.serviceName}-${group.billingType}`}
              serviceName={group.serviceName}
              billingType={group.billingType}
              price={priceForPetSize.price}
              hasHairType={group.hasHairType}
              sizeCategory={petSize}
              selected={isSelected}
              onSelect={(hairType) => {
                // Find the exact price record
                const exactPrice = services.find(s =>
                  s.service_name === group.serviceName &&
                  s.billing_type === group.billingType &&
                  s.size_category === petSize &&
                  (s.hair_type || null) === hairType
                )

                if (exactPrice) {
                  onServiceSelect(exactPrice.id, exactPrice.price, hairType)
                }
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
