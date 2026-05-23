'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  createPetPackage,
  getPackageTypes,
  getPackageWithClient,
  markPackageExhausted,
  renewPackage,
} from '@/lib/actions/packages'
import type { PackageType, PetPackageWithRelations } from '@/lib/types/packages'
import {
  AlertCircle,
  Calendar,
  Check,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import type { SizeCategory } from '@/lib/types/service-prices'

interface ManagePackageModalProps {
  packageData: PetPackageWithRelations | null
  petId: string
  petName: string
  petSize: SizeCategory
  onClose: () => void
  onUpdate: () => void
}

export function ManagePackageModal({
  packageData,
  petId,
  petName,
  petSize,
  onClose,
  onUpdate,
}: ManagePackageModalProps) {
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
  const isCreatingPackage = showNewPackage || !packageData
  const filteredPackageTypes = packageTypes.filter((type) =>
    packageTypeMatchesPetSize(type.name, petSize)
  )

  useEffect(() => {
    if (!isCreatingPackage || packageTypes.length > 0) return

    getPackageTypes().then((result) => {
      if (result.data) setPackageTypes(result.data)
    })
  }, [isCreatingPackage, packageTypes.length])

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
    const result = await getPackageWithClient(packageData.id)
    setLoading(false)

    if (result.error || !result.data?.client) {
      setError('Não foi possível obter informações do cliente')
      return
    }

    const { client, pet, package_type } = result.data
    const phone = client.phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${client.name}!\n\nGostaríamos de avisar que o pacote de banho e tosa do(a) ${pet.name} está com os créditos esgotados.\n\nPacote: ${package_type.name}\n\nEntre em contato para renovar!`
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
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21363a]/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <div className="max-h-[92dvh] w-full overflow-hidden rounded-t-3xl border-t border-[rgba(232,50,123,0.26)] bg-[#fff9fb] shadow-[0_24px_70px_rgba(33,54,58,0.24)] sm:max-w-lg sm:rounded-3xl sm:border">
          <header className="border-b border-[rgba(232,50,123,0.18)] bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8327b] text-white shadow-[0_12px_28px_rgba(232,50,123,0.25)]">
                  <Sparkles size={24} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-extrabold text-[#006c73]">
                    Gerenciar Pacote
                  </h2>
                  <p className="truncate text-sm font-semibold text-[#68797d]">
                    {petName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-[#68797d] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="max-h-[calc(92dvh-81px)] overflow-y-auto p-5 sm:p-6">
            <div className="space-y-5">
              {isCreatingPackage ? (
                <NewPackageView
                  packageData={packageData}
                  packageTypes={filteredPackageTypes}
                  selectedType={selectedType}
                  onBack={() => {
                    setShowNewPackage(false)
                    setSelectedType(null)
                  }}
                  onSelect={setSelectedType}
                  calculateExpiryDate={calculateExpiryDate}
                />
              ) : (
                <CurrentPackageView
                  packageData={packageData}
                  creditsTotal={creditsTotal}
                  progressPercentage={progressPercentage}
                  isExhausted={isExhausted}
                  loading={loading}
                  onMarkExhausted={() => setShowExhaustedConfirm(true)}
                  onSendWhatsApp={handleSendWhatsApp}
                  onRenew={() => setShowRenewConfirm(true)}
                  onNewPackage={() => setShowNewPackage(true)}
                />
              )}

              {selectedType && isCreatingPackage && (
                <Button
                  variant="primary"
                  onClick={handleCreateNewPackage}
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#e8327b] text-white shadow-[0_12px_28px_rgba(232,50,123,0.25)] hover:bg-[#bf185d]"
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

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
                    <AlertCircle size={16} />
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-[#91e8bf] bg-[#e7fff4] p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#0b8b58]">
                    <Check size={16} />
                    {success}
                  </p>
                </div>
              )}

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
      </div>

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

function CurrentPackageView({
  packageData,
  creditsTotal,
  progressPercentage,
  isExhausted,
  loading,
  onMarkExhausted,
  onSendWhatsApp,
  onRenew,
  onNewPackage,
}: {
  packageData: PetPackageWithRelations
  creditsTotal: number
  progressPercentage: number
  isExhausted: boolean
  loading: boolean
  onMarkExhausted: () => void
  onSendWhatsApp: () => void
  onRenew: () => void
  onNewPackage: () => void
}) {
  return (
    <>
      <section className="rounded-2xl border border-[rgba(232,50,123,0.24)] bg-white p-5 shadow-[0_12px_30px_rgba(232,50,123,0.08)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#006c73]">
              Pacote Ativo
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-[#21363a]">
              {packageData.package_type.name}
            </h3>
          </div>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${
              isExhausted
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-[#91e8bf] bg-[#e7fff4] text-[#0b8b58]'
            }`}
          >
            {isExhausted ? 'Esgotado' : 'Ativo'}
          </span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#68797d]">Créditos</span>
            <span className="font-extrabold text-[#21363a]">
              <span className={isExhausted ? 'text-red-600' : 'text-[#e8327b]'}>
                {packageData.credits_remaining}
              </span>
              <span className="mx-1 text-[#9aa8ab]">/</span>
              <span className="text-[#68797d]">{creditsTotal}</span>
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#ffe0ec]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isExhausted ? 'bg-red-500' : 'bg-[#e8327b]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-[#68797d]">
          <Calendar size={14} />
          Expira em {new Date(packageData.expires_at).toLocaleDateString('pt-BR')}
        </div>
      </section>

      <section className="space-y-3">
        <p className="px-1 text-xs font-extrabold uppercase tracking-wider text-[#006c73]">
          Ações do pacote
        </p>

        {!isExhausted && (
          <ActionButton
            icon={<AlertCircle size={22} className="text-orange-500" />}
            title="Marcar como Esgotado"
            description="Zera os créditos do pacote"
            disabled={loading}
            onClick={onMarkExhausted}
          />
        )}

        <ActionButton
          icon={<MessageCircle size={22} className="text-[#18b96f]" />}
          title="Enviar WhatsApp"
          description="Avisar cliente sobre pacote"
          disabled={loading}
          onClick={onSendWhatsApp}
        />

        <ActionButton
          icon={<RefreshCw size={22} className="text-[#006c73]" />}
          title="Renovar Pacote"
          description="Reiniciar créditos e nova data de expiração"
          disabled={loading}
          onClick={onRenew}
        />

        <ActionButton
          icon={<Sparkles size={22} className="text-white" />}
          title="Novo Pacote"
          description="Criar um novo pacote para este pet"
          disabled={loading}
          onClick={onNewPackage}
          accent
        />
      </section>
    </>
  )
}

function NewPackageView({
  packageData,
  packageTypes,
  selectedType,
  onBack,
  onSelect,
  calculateExpiryDate,
}: {
  packageData: PetPackageWithRelations | null
  packageTypes: PackageType[]
  selectedType: PackageType | null
  onBack: () => void
  onSelect: (type: PackageType) => void
  calculateExpiryDate: (intervalDays: number) => string
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        {packageData && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-[#68797d] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
            aria-label="Voltar"
          >
            <X size={18} />
          </button>
        )}
        <div>
          <h3 className="text-lg font-extrabold text-[#006c73]">
            Criar Novo Pacote
          </h3>
          <p className="text-sm font-semibold text-[#68797d]">
            {packageData
              ? 'Este substituirá o pacote atual'
              : 'Selecione um pacote para adicionar ao pet'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {packageTypes.map((type) => {
          const selected = selectedType?.id === type.id

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? 'border-[#e8327b] bg-[#ffe0ec] shadow-[0_10px_24px_rgba(232,50,123,0.12)]'
                  : 'border-[rgba(232,50,123,0.22)] bg-white hover:border-[#ff8cba] hover:bg-[#fff1f6]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold text-[#006c73]">{type.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[#68797d]">
                    <span>{type.credits} créditos</span>
                    <span>R$ {type.price.toFixed(2)}</span>
                    <span>Vence em {calculateExpiryDate(type.interval_days)}</span>
                  </div>
                </div>
                {selected && <Check size={20} className="shrink-0 text-[#e8327b]" />}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ActionButton({
  icon,
  title,
  description,
  disabled,
  onClick,
  accent = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  disabled: boolean
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all disabled:opacity-50 ${
        accent
          ? 'border-[rgba(232,50,123,0.28)] bg-[#fff1f6] hover:border-[#e8327b] hover:bg-[#ffe0ec]'
          : 'border-[rgba(232,50,123,0.18)] bg-white hover:border-[#ff8cba] hover:bg-[#fff1f6]'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? 'bg-[#e8327b]' : 'bg-[#fff1f6]'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-[#21363a]">{title}</span>
        <span className="block text-sm text-[#68797d]">{description}</span>
      </span>
    </button>
  )
}

function packageTypeMatchesPetSize(name: string, petSize: SizeCategory) {
  const normalizedName = normalizeText(name)
  const expectedSize = getPackageSizeLabel(petSize)

  if (!expectedSize) return true

  return normalizedName.includes(expectedSize)
}

function getPackageSizeLabel(petSize: SizeCategory) {
  if (petSize === 'tiny' || petSize === 'small') return 'pequeno'
  if (petSize === 'medium') return 'medio'
  if (petSize === 'large' || petSize === 'giant') return 'grande'
  return null
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
