// src/components/appointments/service-card.tsx
'use client'

import { useState } from 'react'
import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'

interface ServiceCardProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  price: number
  hasHairType: boolean
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  selected?: boolean
  onSelect?: (hairType: 'PC' | 'PL' | null) => void
}

export function ServiceCard({
  serviceName,
  billingType,
  price,
  hasHairType,
  sizeCategory,
  selected = false,
  onSelect
}: ServiceCardProps) {
  const [hairType, setHairType] = useState<'PC' | 'PL'>('PC')

  const handleSelect = () => {
    if (onSelect) {
      onSelect(hasHairType ? hairType : null)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={!onSelect}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'bg-purple-500/30 border-purple-400 text-white'
          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
        }
        ${!onSelect ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{serviceName}</h3>
          <p className="text-xs opacity-70">{billingType === 'avulso' ? 'Avulso' : 'Pacote'}</p>
        </div>
        <span className="text-lg font-bold text-purple-400">
          R$ {price.toFixed(2)}
        </span>
      </div>

      <div className="text-xs opacity-70 mb-2">
        {SIZE_LABELS[sizeCategory]}
      </div>

      {hasHairType && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setHairType('PC')
            }}
            className={`
              px-3 py-1 rounded-lg text-xs transition-all
              ${hairType === 'PC'
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
              setHairType('PL')
            }}
            className={`
              px-3 py-1 rounded-lg text-xs transition-all
              ${hairType === 'PL'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            {HAIR_TYPE_LABELS.PL}
          </button>
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </button>
  )
}
