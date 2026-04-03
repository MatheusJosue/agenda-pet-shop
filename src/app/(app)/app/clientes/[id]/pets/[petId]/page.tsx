'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { updatePet, deletePet } from '@/lib/actions/pets'
import { getValidPetPackage } from '@/lib/actions/packages'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppHeader } from '@/components/layout/app-header'
import { AppLayout } from '@/components/layout/app-layout'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { ManagePackageModal } from '@/components/pacotes/manage-package-modal'
import { Pencil, Trash2, Package, ArrowLeft, Sparkles, Calendar, ChevronRight } from 'lucide-react'
import type { PetWithClient } from '@/lib/types/pets'
import type { PetPackageWithRelations } from '@/lib/types/packages'
import { SIZE_LABELS, SIZE_EMOJIS, SIZE_COLORS } from '@/lib/types/service-prices'
import { HAIR_TYPE_LABELS, type HairType } from '@/lib/types/pets'
import type { SizeCategory } from '@/lib/types/service-prices'

const SIZE_OPTIONS: Array<{ value: SizeCategory; label: string }> = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
  { value: 'giant', label: 'Gigante' }
]

export default function ClientPetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const petId = params.petId as string

  const [pet, setPet] = useState<PetWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePackage, setActivePackage] = useState<PetPackageWithRelations | null>(null)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    size: 'medium' as SizeCategory,
    hairType: 'PC' as HairType,
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import('@/lib/actions/app')
        const result = await getAppStats()
        if (result.data) {
          setCompanyName(result.data.companyName || 'Agenda Pet Shop')
          setUser(result.data.user)
        }
      } catch (error) {
        // Silenced error for initial load
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    loadPet()
    loadActivePackage()
  }, [petId])

  const loadPet = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/pets/${petId}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Pet não encontrado')
        return
      }

      const result = await response.json()

      if (!result.data) {
        setError('Pet não encontrado')
        return
      }

      setPet(result.data)
      setFormData({
        name: result.data.name,
        breed: result.data.breed || '',
        size: result.data.size,
        hairType: result.data.hair_type,
        notes: result.data.notes || '',
      })
    } catch (err) {
      setError('Erro ao carregar pet')
    } finally {
      setLoading(false)
    }
  }

  const loadActivePackage = async () => {
    const result = await getValidPetPackage(petId)
    if (result.data && !result.error) {
      setActivePackage(result.data)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await updatePet(petId, formData)

      if (result.error) {
        setError(result.error)
      } else {
        setPet(result.data || null)
        setEditing(false)
      }
    } catch (err) {
      setError('Erro ao atualizar pet')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setSaving(true)
    setError(null)

    try {
      const deleteResult = await deletePet(petId)

      if (deleteResult.error) {
        setError(deleteResult.error)
      } else {
        router.push(`/app/clientes/${clientId}`)
      }
    } catch (err) {
      setError('Erro ao excluir pet')
    } finally {
      setSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'size' ? value as SizeCategory : value
    }))
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
        <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          </div>

          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />

          <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
            </div>
          </div>

          <BottomNavigation />
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (!pet || error) {
    return (
      <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
        <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          </div>

          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />

          <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Link href={`/app/clientes/${clientId}`}>
                  <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-white/10">
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-white">Pet</h1>
                  <p className="text-white/50 text-sm">Erro</p>
                </div>
              </div>
            </div>
            <GlassCard variant="elevated" className="p-8 text-center">
              <p className="text-red-300 mb-4">{error || 'Pet não encontrado'}</p>
              <Link href={`/app/clientes/${clientId}`}>
                <Button variant="secondary" className="rounded-xl">Voltar</Button>
              </Link>
            </GlassCard>
          </div>

          <BottomNavigation />
        </div>
      </AppLayout>
    )
  }

  const creditsUsed = activePackage ? activePackage.package_type.credits - activePackage.credits_remaining : 0
  const creditsTotal = activePackage?.package_type.credits || 0
  const progressPercentage = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        {/* Header App Bar */}
        <div className="sticky top-0 z-50 px-4 py-4 bg-[#120a21]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href={`/app/clientes/${clientId}`}>
              <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-white/10">
                <ArrowLeft size={22} className="text-white/70" />
              </Button>
            </Link>

            <h1 className="text-lg font-semibold text-white tracking-wide">Detalhes do Pet</h1>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={saving || editing}
                className="p-2 rounded-xl text-white/60 hover:text-[#f183ff] hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <Pencil size={20} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || editing}
                className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 py-6 space-y-4 relative z-10 max-w-7xl mx-auto">
          {error && (
            <GlassCard
              variant="default"
              className="p-4 bg-red-500/10 border-red-500/30 animate-in fade-in slide-in-from-top-2"
            >
              <p className="text-red-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {error}
              </p>
            </GlassCard>
          )}

          {/* Pet Profile Card - Hero Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GlassCard variant="elevated" className="overflow-hidden">
              {/* Profile Header with Gradient Background */}
              <div className="relative h-32 bg-gradient-to-br from-[#f183ff]/30 via-[#d946ef]/20 to-[#8b5cf6]/30">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-[#f183ff]/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#d946ef]/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />

                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {editing && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(false)
                          setFormData({
                            name: pet.name,
                            breed: pet.breed || '',
                            size: pet.size,
                            hairType: pet.hair_type,
                            notes: pet.notes || '',
                          })
                          setError(null)
                        }}
                        disabled={saving}
                        className="rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-[#f183ff] hover:bg-[#f183ff]/90 text-white border-0 shadow-lg shadow-[#f183ff]/30"
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Pet Avatar */}
              <div className="relative px-6 -mt-16 mb-4">
                <div className="relative w-28 h-28 mx-auto">
                  {/* Avatar glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f183ff] via-[#d946ef] to-[#8b5cf6] blur-lg opacity-60 animate-pulse" />

                  {/* Avatar container */}
                  <div className="relative w-full h-full rounded-full bg-[#120a21] border-4 border-[#f183ff]/30 flex items-center justify-center text-5xl shadow-2xl">
                    {SIZE_EMOJIS[pet.size]}
                  </div>

                  {/* Size badge */}
                  <div className={`absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg ${SIZE_COLORS[pet.size]}`}>
                    {pet.size.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div className="px-6 pb-6 text-center">
                {editing ? (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      minLength={2}
                      className="w-full text-center text-xl font-semibold"
                      placeholder="Nome do pet"
                    />
                    <Input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => handleChange('breed', e.target.value)}
                      placeholder="Raça (opcional)"
                      className="w-full text-center"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{pet.name}</h2>
                    {pet.breed && (
                      <p className="text-white/60 text-sm mb-3">{pet.breed}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="px-3 py-1.5 rounded-full bg-[#f183ff]/20 border border-[#f183ff]/30 text-[#f183ff] text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                        <span className="text-sm">{SIZE_EMOJIS[pet.size]}</span>
                        {SIZE_LABELS[pet.size]}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-[#d946ef]/20 border border-[#d946ef]/30 text-[#d946ef] text-xs font-semibold uppercase tracking-wide">
                        {HAIR_TYPE_LABELS[pet.hair_type]}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Technical Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Size Card */}
            <GlassCard variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center text-xl shadow-lg shadow-[#8b5cf6]/10">
                  📏
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Porte</p>
                  <p className="text-white text-sm font-medium truncate">{SIZE_LABELS[pet.size]}</p>
                </div>
              </div>
            </GlassCard>

            {/* Hair Type Card */}
            <GlassCard variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d946ef]/20 to-[#a855f7]/20 flex items-center justify-center text-xl shadow-lg shadow-[#d946ef]/10">
                  ✂️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Tipo de Pelo</p>
                  <p className="text-white text-sm font-medium truncate">{HAIR_TYPE_LABELS[pet.hair_type]}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Owner Card */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <GlassCard variant="default" className="p-4">
              <Link
                href={`/app/clientes/${pet.client.id}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#9333ea]/20 flex items-center justify-center text-xl shadow-lg shadow-[#a855f7]/10 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Dono (Tutor)</p>
                  <p className="text-white text-sm font-medium truncate group-hover:text-[#f183ff] transition-colors">
                    {pet.client.name}
                  </p>
                </div>
                <ChevronRight size={18} className="text-white/30 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all" />
              </Link>
            </GlassCard>
          </div>

          {/* Notes Card */}
          {(pet.notes || editing) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <GlassCard variant="default" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-lg shadow-lg shadow-[#f183ff]/10 flex-shrink-0 mt-0.5">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Observações</p>
                    {editing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Adicione observações sobre o pet..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                      />
                    ) : (
                      <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                        {pet.notes || <span className="text-white/30 italic">Nenhuma observação</span>}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Edit Mode - Size & Hair Type Selection */}
          {editing && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Size Selection */}
              <GlassCard variant="default" className="p-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center text-xs">📏</span>
                  Porte *
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange('size', option.value)}
                      className={`px-2 py-2.5 rounded-xl border transition-all text-xs font-medium ${
                        formData.size === option.value
                          ? "bg-gradient-to-br from-[#f183ff] to-[#d946ef] border-[#f183ff] text-white shadow-lg shadow-[#f183ff]/20"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <span className="block text-lg mb-1">{SIZE_EMOJIS[option.value]}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Hair Type Selection */}
              <GlassCard variant="default" className="p-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#6366f1]/20 flex items-center justify-center text-xs">✂️</span>
                  Tipo de Pelo *
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(HAIR_TYPE_LABELS) as [HairType, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('hairType', value)}
                      className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        formData.hairType === value
                          ? "bg-gradient-to-br from-[#f183ff] to-[#d946ef] border-[#f183ff] text-white shadow-lg shadow-[#f183ff]/20"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Package/Credits Section */}
          {activePackage ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <GlassCard variant="elevated" className="overflow-hidden">
                {/* Header with gradient border */}
                <div className="relative p-5 bg-gradient-to-br from-[#f183ff]/10 via-[#d946ef]/5 to-[#8b5cf6]/10">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f183ff] via-[#d946ef] to-[#8b5cf6]" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/30">
                        <Sparkles size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Pacote Ativo</p>
                        <h3 className="text-white font-bold text-lg">{activePackage.package_type.name}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPackageModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all border border-white/10"
                    >
                      Gerenciar
                    </button>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="p-5 space-y-4">
                  {/* Credits Display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Créditos</p>
                      <p className="text-white text-2xl font-bold">
                        <span className="text-[#f183ff]">{activePackage.credits_remaining}</span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-white/60">{activePackage.package_type.credits}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs mb-1">Restantes</p>
                      <p className="text-[#f183ff] font-semibold">
                        {Math.round(((activePackage.package_type.credits - activePackage.credits_remaining) / activePackage.package_type.credits) * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f183ff]/20 to-[#d946ef]/20 rounded-full blur-sm" />

                    {/* Progress fill */}
                    <div
                      className="relative h-full bg-gradient-to-r from-[#f183ff] via-[#d946ef] to-[#8b5cf6] rounded-full transition-all duration-700 ease-out shadow-lg shadow-[#f183ff]/30"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Calendar size={14} className="text-white/40" />
                    <p className="text-white/40 text-xs">
                      Expira em <span className="text-white/60">{new Date(activePackage.expires_at).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <button
                onClick={() => setShowPackageModal(true)}
                className="w-full"
              >
                <GlassCard variant="default" className="p-5 hover:border-[#f183ff]/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#f183ff]/10">
                      <Package size={22} className="text-[#f183ff]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Pacotes</p>
                      <p className="text-white font-semibold">Adicionar pacote</p>
                    </div>
                    <ChevronRight size={20} className="text-white/30 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all" />
                  </div>
                </GlassCard>
              </button>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <p className="text-white/20 text-xs">
              Cadastrado em {new Date(pet.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Package Modal */}
      {showPackageModal && (
        <ManagePackageModal
          packageData={activePackage}
          petId={petId}
          petName={pet?.name || ''}
          onClose={() => setShowPackageModal(false)}
          onUpdate={() => {
            loadActivePackage()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Excluir pet?"
        description="Esta ação não pode ser desfeita! Você perderá todos os dados e históricos vinculados a este pet."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        icon="trash"
        loading={saving}
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </AppLayout>
  )
}
