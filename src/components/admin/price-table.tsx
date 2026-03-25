// src/components/admin/price-table.tsx
'use client'

import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'
import type { ServicePrice } from '@/lib/types/service-prices'
import { Button } from '@/components/ui/button'

interface PriceTableProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  prices: ServicePrice[]
  onEdit: () => void
}

const SIZES: Array<'tiny' | 'small' | 'medium' | 'large' | 'giant'> =
  ['tiny', 'small', 'medium', 'large', 'giant']

export function PriceTable({ serviceName, billingType, prices, onEdit }: PriceTableProps) {
  // Determine if service has hair types
  const hasHairType = prices.some(p => p.hair_type !== null)

  // Create a map for quick lookup
  const priceMap = prices.reduce((acc, price) => {
    const key = `${price.hair_type || 'default'}-${price.size_category}`
    acc[key] = price.price
    return acc
  }, {} as Record<string, number>)

  // Get unique hair types
  const hairTypes = hasHairType
    ? (['PC', 'PL'] as const)
    : [null] as const

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{serviceName}</h3>
          <p className="text-sm text-purple-300/70">
            {billingType === 'avulso' ? 'Avulso' : 'Pacote'}
          </p>
        </div>
        <Button
          onClick={onEdit}
          variant="secondary"
          size="sm"
        >
          Editar Preços
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-purple-200/70 font-medium">
                Tipo de Pelo
              </th>
              {SIZES.map(size => (
                <th key={size} className="p-2 text-center text-purple-200/70 font-medium">
                  {SIZE_LABELS[size]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hairTypes.map(hairType => (
              <tr key={hairType || 'default'} className="border-b border-white/5">
                <td className="p-2 font-medium">
                  {hairType ? HAIR_TYPE_LABELS[hairType] : 'Padrão'}
                </td>
                {SIZES.map(size => {
                  const key = `${hairType || 'default'}-${size}`
                  const price = priceMap[key]

                  return (
                    <td key={size} className="p-2 text-center">
                      {price !== undefined ? (
                        <span className="text-purple-300">
                          R$ {price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-purple-200/30">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
