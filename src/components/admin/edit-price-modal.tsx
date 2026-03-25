// src/components/admin/edit-price-modal.tsx
'use client'

import { useState } from 'react'
import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'
import type { ServicePrice, SizeCategory } from '@/lib/types/service-prices'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditPriceModalProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  currentPrices: ServicePrice[]
  open: boolean
  onClose: () => void
  onSave: (updates: Array<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
    hairType?: 'PC' | 'PL'
    sizeCategory: SizeCategory
    price: number
  }>) => Promise<void>
}

const SIZES: Array<SizeCategory> = ['tiny', 'small', 'medium', 'large', 'giant']

export function EditPriceModal({
  serviceName,
  billingType,
  currentPrices,
  open,
  onClose,
  onSave
}: EditPriceModalProps) {
  const [saving, setSaving] = useState(false)
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    currentPrices.forEach(price => {
      const key = `${price.hair_type || 'default'}-${price.size_category}`
      initial[key] = price.price.toString()
    })
    return initial
  })

  const hasHairType = currentPrices.some(p => p.hair_type !== null)
  const hairTypes = hasHairType ? (['PC', 'PL'] as const) : [null] as const

  const handleSave = async () => {
    setSaving(true)

    const updates = []

    for (const hairType of hairTypes) {
      for (const size of SIZES) {
        const key = `${hairType || 'default'}-${size}`
        const value = prices[key]

        if (value !== undefined && value !== '') {
          updates.push({
            serviceName,
            billingType,
            hairType: hairType || undefined,
            sizeCategory: size,
            price: parseFloat(value)
          })
        }
      }
    }

    await onSave(updates)
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Editar: {serviceName}
              </h2>
              <p className="text-sm text-purple-300/70">
                {billingType === 'avulso' ? 'Avulso' : 'Pacote'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {hairTypes.map(hairType => (
              <div key={hairType || 'default'}>
                <h4 className="font-medium text-white mb-3">
                  {hairType ? HAIR_TYPE_LABELS[hairType] : 'Padrão'}
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {SIZES.map(size => {
                    const key = `${hairType || 'default'}-${size}`

                    return (
                      <div key={size}>
                        <label className="block text-xs text-purple-200/70 mb-1">
                          {SIZE_LABELS[size]}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={prices[key] || ''}
                          onChange={(e) => setPrices(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
