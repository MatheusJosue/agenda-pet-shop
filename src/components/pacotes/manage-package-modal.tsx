'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  markPackageExhausted,
  renewPackage,
  getPackageWithClient,
  getPackageTypes,
  createPetPackage,
} from '@/lib/actions/packages'
import type { PetPackageWithRelations } from '@/lib/types/packages'
import type { PackageType } from '@/lib/types/packages'
import {
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  X,
  Check,
  Loader2,
} from 'lucide-react'

interface ManagePackageModalProps {
  packageData: PetPackageWithRelations | null
  petId: string
  petName: string
  onClose: () => void
  onUpdate: () => void
}

export function ManagePackageModal({
  packageData,
  petId,
  petName,
  onClose,
  onUpdate,
}: ManagePackageModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showExhaustedConfirm, setShowExhaustedConfirm] = useState(false)
  const [showRenewConfirm, setShowRenewConfirm] = useState(false)
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([])
  const [selectedType, setSelectedType] = useState<PackageType | null>(null)
  const [showNewPackage, setShowNewPackage] = useState(false)

  const creditsUsed = packageData
    ? packageData.package_type.credits - packageData.credits_remaining
    : 0
  const creditsTotal = packageData?.package_type.credits || 0
  const progressPercentage =
    creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0
  const isExhausted = packageData?.credits_remaining === 0

  // Load package types for new package
  useEffect(() => {
    if (showNewPackage) {
      getPackageTypes().then((result) => {
        if (result.data) {
          setPackageTypes(result.data)
        }
      })
    }
  }, [showNewPackage])

  const handleMarkExhausted = async () => {
    if (!packageData) return

    setLoading(true)
    setError(null)

    const result = await markPackageExhausted(packageData.id)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess('Pacote marcado como esgotado com sucesso!')
    setTimeout(() => {
      onUpdate()
      onClose()
    }, 1500)
  }

  const handleRenew = async () => {
    if (!packageData) return

    setLoading(true)
    setError(null)

    const result = await renewPackage(packageData.id)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess('Pacote renovado com sucesso!')
    setTimeout(() => {
      onUpdate()
      onClose()
    }, 1500)
  }

  const handleSendWhatsApp = async () => {
    if (!packageData) return

    setLoading(true)
    setError(null)

    // Get package with client info
    const result = await getPackageWithClient(packageData.id)

    setLoading(false)

    if (result.error || !result.data?.client) {
      setError('Não foi possível obter informações do cliente')
      return
    }

    const { client, pet, package_type } = result.data

    // Format phone number for WhatsApp
    const phone = client.phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${client.name}! 👋\n\nGostaríamos de avisar que o pacote de banho e tosa do(a) ${pet.name} está com os créditos esgotados. \n\nPacote: ${package_type.name}\n\nEntre em contato para renovar! 🐾`
    )

    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
  }

  const handleCreateNewPackage = async () => {
    if (!selectedType) return

    setLoading(true)
    setError(null)

    const result = await createPetPackage({
      petId,
      packageTypeId: selectedType.id,
      startsAt: new Date(),
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess('Novo pacote criado com sucesso!')
    setTimeout(() => {
      onUpdate()
      onClose()
    }, 1500)
  }

  const calculateExpiryDate = (intervalDays: number) => {
    const date = new Date()
    date.setDate(date.getDate() + intervalDays)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in">
        <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#120a21] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10">
          {/* Header */}
          <div className="sticky top-0 bg-[#120a21]/95 backdrop-blur-xl px-6 py-5 border-b border-white/5 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center shadow-lg shadow-[#f183ff]/10">
                  <Sparkles size={24} className="text-[#f183ff]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Gerenciar Pacote</h2>
                  <p className="text-white/50 text-sm">{petName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {packageData && !showNewPackage ? (
              <>
                {/* Current Package Info */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#f183ff]/10 via-[#d946ef]/5 to-[#8b5cf6]/10 border border-[#f183ff]/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Pacote Ativo
                      </p>
                      <h3 className="text-white font-bold text-lg mt-1">
                        {packageData.package_type.name}
                      </h3>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      isExhausted
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-[#00ffa3]/20 text-[#00ffa3] border-[#00ffa3]/30'
                    }`}>
                      {isExhausted ? 'Esgotado' : 'Ativo'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Créditos</span>
                      <span className="text-white font-semibold">
                        <span className={isExhausted ? 'text-red-400' : 'text-[#f183ff]'}>
                          {packageData.credits_remaining}
                        </span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-white/60">{creditsTotal}</span>
                      </span>
                    </div>
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isExhausted
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : 'bg-gradient-to-r from-[#f183ff] via-[#d946ef] to-[#8b5cf6]'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Calendar size={14} />
                    Expira em{' '}
                    {new Date(packageData.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="space-y-3">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider px-1">
                    Ações do Pacote
                  </p>

                  {/* Mark Exhausted */}
                  {!isExhausted && (
                    <button
                      onClick={() => setShowExhaustedConfirm(true)}
                      disabled={loading}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all group disabled:opacity-50"
                    >
                      <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={22} className="text-orange-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">Marcar como Esgotado</p>
                        <p className="text-white/40 text-sm">Zera os créditos do pacote</p>
                      </div>
                    </button>
                  )}

                  {/* Send WhatsApp */}
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 transition-all group disabled:opacity-50"
                  >
                    <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle size={22} className="text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">Enviar WhatsApp</p>
                      <p className="text-white/40 text-sm">Avisar cliente sobre pacote</p>
                    </div>
                  </button>

                  {/* Renew Package */}
                  <button
                    onClick={() => setShowRenewConfirm(true)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-[#f183ff]/10 border border-white/5 hover:border-[#f183ff]/30 transition-all group disabled:opacity-50"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#f183ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <RefreshCw size={22} className="text-[#f183ff]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">Renovar Pacote</p>
                      <p className="text-white/40 text-sm">
                        Reiniciar créditos e nova data de expiração
                      </p>
                    </div>
                  </button>

                  {/* Create New Package */}
                  <button
                    onClick={() => setShowNewPackage(true)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 hover:from-[#f183ff]/20 hover:to-[#d946ef]/20 border border-[#f183ff]/30 hover:border-[#f183ff]/50 transition-all group disabled:opacity-50"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#f183ff] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#f183ff]/30">
                      <Sparkles size={22} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">Novo Pacote</p>
                      <p className="text-white/40 text-sm">
                        Criar um novo pacote (substitui o atual)
                      </p>
                    </div>
                  </button>
                </div>
              </>
            ) : showNewPackage ? (
              <>
                {/* New Package Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => {
                        setShowNewPackage(false)
                        setSelectedType(null)
                      }}
                      className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X size={18} />
                    </button>
                    <div>
                      <h3 className="text-white font-semibold">Criar Novo Pacote</h3>
                      <p className="text-white/40 text-sm">
                        Este substituirá o pacote atual
                      </p>
                    </div>
                  </div>

                  {packageTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        selectedType?.id === type.id
                          ? 'bg-[#f183ff]/20 border-[#f183ff]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{type.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                            <span>{type.credits} créditos</span>
                            <span>R$ {type.price.toFixed(2)}</span>
                            <span>Vence em {calculateExpiryDate(type.interval_days)}</span>
                          </div>
                        </div>
                        {selectedType?.id === type.id && (
                          <Check size={20} className="text-[#f183ff]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedType && (
                  <Button
                    variant="primary"
                    onClick={handleCreateNewPackage}
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-lg shadow-[#f183ff]/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Confirmar Novo Pacote
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/40">Nenhum pacote ativo</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-4 rounded-2xl bg-[#00ffa3]/10 border border-[#00ffa3]/30">
                <p className="text-[#00ffa3] text-sm flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </p>
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-2xl"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Exhausted Dialog */}
      <ConfirmDialog
        open={showExhaustedConfirm}
        onOpenChange={setShowExhaustedConfirm}
        onConfirm={handleMarkExhausted}
        title="Marcar pacote como esgotado?"
        description="Isso zerará os créditos restantes do pacote. Esta ação não pode ser desfeita."
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="danger"
        icon="alert"
        loading={loading}
      />

      {/* Confirm Renew Dialog */}
      <ConfirmDialog
        open={showRenewConfirm}
        onOpenChange={setShowRenewConfirm}
        onConfirm={handleRenew}
        title="Renovar pacote?"
        description={`Os créditos serão reiniciados para ${creditsTotal} e uma nova data de expiração será calculada a partir de hoje.`}
        confirmText="Renovar"
        cancelText="Cancelar"
        variant="default"
        icon="refresh"
        loading={loading}
      />
    </>
  )
}
