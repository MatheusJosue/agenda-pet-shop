'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { Trash2, Eye, Pencil } from 'lucide-react'
import { getPets, createPet, deletePet } from '@/lib/actions/pets'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PetWithClient } from '@/lib/types/pets'

const SIZE_LABELS = {
  small: 'P',
  medium: 'M',
  large: 'G'
}

const SIZE_COLORS = {
  small: 'bg-green-500/20 text-green-200',
  medium: 'bg-yellow-500/20 text-yellow-200',
  large: 'bg-red-500/20 text-red-200'
}

interface ClientPetsSectionProps {
  clientId: string
}

export function ClientPetsSection({ clientId }: ClientPetsSectionProps) {
  const [pets, setPets] = useState<PetWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: ''
  })

  useEffect(() => {
    loadPets()
  }, [clientId])

  const loadPets = async () => {
    setLoading(true)
    const result = await getPets(clientId)
    if (result.error) {
      setError(result.error)
    } else {
      setPets(result.data || [])
    }
    setLoading(false)
  }

  const handleCreatePet = async () => {
    if (!formData.name.trim()) return

    setSaving(true)
    setError(null)

    try {
      const result = await createPet({
        clientId,
        name: formData.name.trim(),
        breed: formData.breed.trim() || undefined,
        size: formData.size,
        notes: formData.notes.trim() || undefined
      })

      if (result.error) {
        setError(result.error)
      } else {
        await loadPets()
        setShowAddForm(false)
        setFormData({ name: '', breed: '', size: 'medium', notes: '' })
      }
    } catch (err) {
      setError('Erro ao criar pet')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePet = async (petId: string) => {
    const result = await Swal.fire({
      title: 'Excluir pet?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255, 255, 255, 0.1)',
    })

    if (!result.isConfirmed) return

    setSaving(true)
    const deleteResult = await deletePet(petId)
    if (deleteResult.error) {
      setError(deleteResult.error)
      await Swal.fire({
        title: 'Erro!',
        text: deleteResult.error,
        icon: 'error',
        confirmButtonText: 'OK',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      })
    } else {
      await Swal.fire({
        title: 'Excluído!',
        text: 'O pet foi excluído com sucesso.',
        icon: 'success',
        confirmButtonText: 'OK',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)',
        color: '#fff',
        confirmButtonColor: '#a855f7',
      })
      await loadPets()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">
          Pets ({pets.length})
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Pet'}
        </Button>
      </div>

      {error && (
        <GlassCard variant="default" className="p-4 bg-red-500/20 border-red-500/50">
          <p className="text-red-200">{error}</p>
        </GlassCard>
      )}

      {showAddForm && (
        <GlassCard variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Novo Pet</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nome *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Rex, Mimi, Bob..."
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Raça
              </label>
              <Input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Ex: Poodle, Vira-lata..."
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Porte *
              </label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, size })}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.size === size
                        ? 'bg-purple-500 border-purple-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {SIZE_LABELS[size]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Alérgico a certos alimentos, prefere banho rápido..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                onClick={handleCreatePet}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ name: '', breed: '', size: 'medium', notes: '' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <p className="text-white/60">Carregando pets...</p>
      ) : pets.length === 0 ? (
        <GlassCard variant="default" className="p-8 text-center">
          <p className="text-white/60">Nenhum pet cadastrado</p>
          <p className="text-white/40 text-sm mt-2">
            Clique em "Adicionar Pet" para cadastrar o primeiro pet deste cliente.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {pets.map((pet) => (
            <GlassCard key={pet.id} variant="default" className="p-4 hover:bg-white/[0.08] transition-colors">
              <div className="flex justify-between items-start gap-4">
                <Link href={`/app/pets/${pet.id}`} className="flex-1 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{pet.name}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${SIZE_COLORS[pet.size]}`}>
                      {SIZE_LABELS[pet.size]}
                    </span>
                  </div>
                  {pet.breed && (
                    <p className="text-white/70 text-sm">Raça: {pet.breed}</p>
                  )}
                  {pet.notes && (
                    <p className="text-white/60 text-sm mt-2">{pet.notes}</p>
                  )}
                </Link>
                <div className="flex gap-2">
                  <Link href={`/app/pets/${pet.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePet(pet.id)}
                    disabled={saving}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
