// src/components/appointments/service-card.tsx
'use client'

import { useState } from 'react'
import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'
import type { HairType } from '@/lib/types/pets'

interface ServiceCardProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  price: number
  pricePL?: number  // Preço para pelo longo
  hasHairType: boolean
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  petHairType?: HairType  // Pet's hair type - if provided, use it automatically
  selected?: boolean
  onSelect?: (hairType: 'PC' | 'PL' | null) => void
}

export function ServiceCard({
  serviceName,
  billingType,
  price,
  pricePL,
  hasHairType,
  sizeCategory,
  petHairType,
  selected = false,
  onSelect
}: ServiceCardProps) {
  // Use pet's hair type if provided, otherwise use local state for manual selection
  const [manualHairType, setManualHairType] = useState<'PC' | 'PL'>('PC')
  const activeHairType = petHairType || manualHairType

  const handleSelect = () => {
    if (onSelect) {
      onSelect(hasHairType ? activeHairType : null)
    }
  }

  const currentPrice = activeHairType === 'PL' && pricePL ? pricePL : price

  return (
    <div
      onClick={handleSelect}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
        ${selected
          ? 'bg-purple-500/30 border-purple-400 text-white'
          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
        }
        ${!onSelect ? 'cursor-not-allowed opacity-60' : ''}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{serviceName}</h3>
          <p className="text-xs opacity-70">{billingType === 'avulso' ? 'Avulso' : 'Pacote'}</p>
        </div>
        <span className="text-lg font-bold text-purple-400">
          R$ {currentPrice.toFixed(2)}
        </span>
      </div>

      <div className="text-xs opacity-70 mb-2">
        {SIZE_LABELS[sizeCategory]}
      </div>

      {hasHairType && (
        <div className="mt-3">
          {petHairType ? (
            // Show badge when pet's hair type is known
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <span className="text-xs text-purple-200">Tipo:</span>
              <span className="text-xs font-medium text-white">
                {HAIR_TYPE_LABELS[petHairType]}
              </span>
            </div>
          ) : (
            // Show toggle buttons when pet's hair type is unknown
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setManualHairType('PC')
                  // Atualizar seleção se já estiver selecionado
                  if (selected && onSelect) {
                    onSelect('PC')
                  }
                }}
                className={`
                  px-3 py-1 rounded-lg text-xs transition-all
                  ${activeHairType === 'PC'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                  }
                `}
              >
                {HAIR_TYPE_LABELS.PC}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setManualHairType('PL')
                  // Atualizar seleção se já estiver selecionado
                  if (selected && onSelect) {
                    onSelect('PL')
                  }
                }}
                className={`
                  px-3 py-1 rounded-lg text-xs transition-all
                  ${activeHairType === 'PL'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                  }
                `}
              >
                {HAIR_TYPE_LABELS.PL}
              </button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </div>
  )
}
