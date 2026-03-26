// src/components/appointments/service-selector.tsx
'use client'

import { useEffect, useState } from 'react'
import { ServiceCard } from './service-card'
import { getServicePrices } from '@/lib/actions/service-prices'
import type { ServicePrice, SizeCategory, BillingType } from '@/lib/types/service-prices'
import { BILLING_TYPE_LABELS } from '@/lib/types/service-prices'
import type { HairType } from '@/lib/types/pets'

interface ServiceSelectorProps {
  petSize: SizeCategory
  petHairType: HairType
  billingType: BillingType
  selectedServicePriceId?: string
  onServiceSelect: (servicePriceId: string, price: number, hairType: 'PC' | 'PL' | null) => void
}

interface GroupedService {
  serviceName: string
  billingType: BillingType
  hasHairType: boolean
  pricesBySize: Record<SizeCategory, ServicePrice | null>
  pricesBySizeAndHair: Record<SizeCategory, { PC?: ServicePrice; PL?: ServicePrice }>
}

export function ServiceSelector({
  petSize,
  petHairType,
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
        },
        pricesBySizeAndHair: {
          tiny: {},
          small: {},
          medium: {},
          large: {},
          giant: {}
        }
      }
    }

    // Store price by size category
    acc[key].pricesBySize[price.size_category] = price

    // Store price by size AND hair type
    const hairType = price.hair_type || 'PC'
    acc[key].pricesBySizeAndHair[price.size_category][hairType] = price

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
        Nenhum serviço encontrado para {BILLING_TYPE_LABELS[billingType]}.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-purple-100/90 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
          ✨
        </span>
        Serviços ({BILLING_TYPE_LABELS[billingType]}) *
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(groupedServices).map((group) => {
          const pricesForPetSize = group.pricesBySizeAndHair[petSize]

          // Determine which price to use based on pet's hair type
          // If service has hair type options, use pet's hair type
          // If service doesn't have hair type options (hair_type is null), use that
          let targetPrice: ServicePrice | null = null
          let displayHairType: 'PC' | 'PL' | null = null

          if (group.hasHairType) {
            // Service has PC/PL options, use pet's hair type
            targetPrice = pricesForPetSize[petHairType] || null
            displayHairType = petHairType
          } else {
            // Service has no hair type distinction (null)
            targetPrice = pricesForPetSize.PC || pricesForPetSize.PL || null
            displayHairType = null
          }

          if (!targetPrice) {
            return null
          }

          const isSelected = selectedServicePriceId === targetPrice.id

          // When service has hair type options, automatically select based on pet's hair type
          // No need to show toggle buttons
          const handleSelect = () => {
            onServiceSelect(targetPrice!.id, targetPrice!.price, displayHairType)
          }

          return (
            <ServiceCard
              key={`${group.serviceName}-${group.billingType}`}
              serviceName={group.serviceName}
              billingType={group.billingType}
              price={targetPrice.price}
              pricePL={group.hasHairType ? pricesForPetSize.PL?.price : undefined}
              hasHairType={group.hasHairType}
              sizeCategory={petSize}
              petHairType={petHairType}
              selected={isSelected}
              onSelect={() => handleSelect()}
            />
          )
        })}
      </div>
    </div>
  )
}
