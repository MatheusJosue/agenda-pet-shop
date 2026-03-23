'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { createPetPackage, getPackageTypes } from '@/lib/actions/packages'
import type { PackageType } from '@/lib/types/packages'

interface AddPackageModalProps {
  petId: string
  petName: string
  onClose: () => void
}

export function AddPackageModal({ petId, petName, onClose }: AddPackageModalProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Load package types on mount
  useEffect(() => {
    getPackageTypes().then(result => {
      if (result.data) {
        setPackageTypes(result.data)
      }
      setLoadingTypes(false)
    })
  }, [])

  const handleSubmit = async () => {
    if (!selectedType) return

    setLoading(true)
    setError(null)

    const result = await createPetPackage({
      petId,
      packageTypeId: selectedType.id,
      startsAt: new Date()
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onClose()
    router.refresh()
  }

  const calculateExpiryDate = (intervalDays: number) => {
    const date = new Date()
    date.setDate(date.getDate() + intervalDays)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Adicionar Pacote - {petName}
        </h2>

        {loadingTypes ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-purple-200/60 mb-2">Selecione o tipo de pacote:</p>
              {packageTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedType?.id === type.id
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold text-white">{type.name}</p>
                  <div className="flex justify-between mt-2 text-sm text-purple-200/60">
                    <span>{type.credits} créditos</span>
                    <span>R$ {type.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-purple-200/40 mt-1">
                    Vence em {calculateExpiryDate(type.interval_days)}
                  </p>
                </button>
              ))}
            </div>

            {selectedType && (
              <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-200">
                  <strong>Resumo:</strong>
                </p>
                <ul className="text-sm text-purple-200/80 mt-2 space-y-1">
                  <li>• {selectedType.name}</li>
                  <li>• {selectedType.credits} créditos incluídos</li>
                  <li>• Vence em {calculateExpiryDate(selectedType.interval_days)}</li>
                  <li>• Valor: R$ {selectedType.price.toFixed(2)}</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!selectedType || loading}
                className="flex-1"
              >
                {loading ? 'Criando...' : 'Confirmar'}
              </Button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
