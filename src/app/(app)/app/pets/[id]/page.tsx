'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getPetById, updatePet, deletePet } from '@/lib/actions/pets'
import { getActivePetPackage } from '@/lib/actions/packages'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PackageCard } from '@/components/pacotes/package-card'
import { AddPackageModal } from '@/components/pacotes/add-package-modal'
import type { PetWithClient } from '@/lib/types/pets'
import type { PetPackageWithRelations } from '@/lib/types/packages'
import { Pencil, Trash2, Package } from 'lucide-react'

const sizeLabels = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande'
}

const sizeEmojis = {
  small: '🐱',
  medium: '🐕',
  large: '🦮'
}

export default function PetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const petId = params.id as string

  const [pet, setPet] = useState<PetWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePackage, setActivePackage] = useState<PetPackageWithRelations | null>(null)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: '',
  })

  useEffect(() => {
    loadPet()
    loadActivePackage()
  }, [petId])

  const loadPet = async () => {
    setLoading(true)
    const result = await getPetById(petId)

    if (result.error || !result.data) {
      setError(result.error || 'Pet não encontrado')
    } else {
      setPet(result.data)
      setFormData({
        name: result.data.name,
        breed: result.data.breed || '',
        size: result.data.size,
        notes: result.data.notes || '',
      })
    }
    setLoading(false)
  }

  const loadActivePackage = async () => {
    const result = await getActivePetPackage(petId)
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
    if (!confirm('Tem certeza que deseja excluir este pet?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const result = await deletePet(petId)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/pets')
      }
    } catch (err) {
      setError('Erro ao excluir pet')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-purple-200/60">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!pet || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GlassCard variant="default" className="p-8 text-center">
            <p className="text-red-400 mb-4">{error || 'Pet não encontrado'}</p>
            <Link href="/app/pets">
              <Button variant="secondary">Voltar</Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/app/pets"
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              ←
            </span>
            <span className="font-medium">Voltar para Pets</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Title Section with Icon */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                {sizeEmojis[pet.size]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  {pet.name}
                </h1>
                <p className="text-purple-200/60">
                  {editing ? 'Editando' : 'Detalhes'} do pet
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: pet.name,
                        breed: pet.breed || '',
                        size: pet.size,
                        notes: pet.notes || '',
                      })
                      setError(null)
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowPackageModal(true)}
                    disabled={saving}
                  >
                    <Package size={18} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setEditing(true)}
                    disabled={saving}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <Trash2 size={18} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <GlassCard variant="default" className="p-4 mb-6 bg-red-500/20 border-red-500/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        )}

        {/* Package Section */}
        {activePackage && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📦</span>
              Pacote Ativo
            </h2>
            <PackageCard packageData={activePackage} />
          </div>
        )}

        <GlassCard variant="default" className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-7">
              {/* Name */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                <label htmlFor="name" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐾</span>
                  Nome do Pet *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  minLength={2}
                  className="w-full"
                />
              </div>

              {/* Breed */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <label htmlFor="breed" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🎨</span>
                  Raça
                </label>
                <Input
                  id="breed"
                  type="text"
                  value={formData.breed}
                  onChange={(e) => handleChange('breed', e.target.value)}
                  placeholder="Ex: Poodle, Vira-lata..."
                  className="w-full"
                />
              </div>

              {/* Size */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                <label className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📏</span>
                  Porte *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Pequeno', emoji: '🐱' },
                    { value: 'medium', label: 'Médio', emoji: '🐕' },
                    { value: 'large', label: 'Grande', emoji: '🦮' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => handleChange('size', size.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.size === size.value
                          ? 'bg-purple-500/30 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <div className="text-2xl mb-1">{size.emoji}</div>
                      <div className="text-sm">{size.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                <label htmlFor="notes" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📝</span>
                  Observações
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Adicione observações sobre o pet..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '350ms' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      name: pet.name,
                      breed: pet.breed || '',
                      size: pet.size,
                      notes: pet.notes || '',
                    })
                    setError(null)
                  }}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="text-5xl">{sizeEmojis[pet.size]}</div>
                <div className="flex-1">
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐾</span>
                    Nome
                  </h2>
                  <p className="text-2xl font-semibold text-white">{pet.name}</p>
                </div>
              </div>

              {pet.breed && (
                <div>
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🎨</span>
                    Raça
                  </h2>
                  <p className="text-white text-lg">{pet.breed}</p>
                </div>
              )}

              <div>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📏</span>
                  Porte
                </h2>
                <p className="text-white text-lg">
                  {sizeEmojis[pet.size]} {sizeLabels[pet.size]}
                </p>
              </div>

              <div>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">👤</span>
                  Dono
                </h2>
                <Link
                  href={`/app/clientes/${pet.client.id}`}
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  {pet.client.name}
                </Link>
                <p className="text-purple-200/50 text-sm mt-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📱</span>
                  {pet.client.phone}
                </p>
              </div>

              {pet.notes && (
                <div>
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📝</span>
                    Observações
                  </h2>
                  <p className="text-white whitespace-pre-wrap bg-white/5 rounded-xl p-4 border border-white/10">{pet.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className="text-purple-200/30 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📅</span>
                  Cadastrado em {new Date(pet.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Add Package Modal */}
        {showPackageModal && pet && (
          <AddPackageModal
            petId={pet.id}
            petName={pet.name}
            onClose={() => {
              setShowPackageModal(false)
              loadActivePackage()
            }}
          />
        )}
      </main>
    </div>
  )
}
