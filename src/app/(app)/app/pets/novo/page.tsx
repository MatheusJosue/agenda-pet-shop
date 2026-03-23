'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPet } from '@/lib/actions/pets'
import { getClients } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function NovoPetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const result = await getClients()
    if (result.data) {
      setClients(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.clientId) {
      setError('Selecione o dono do pet')
      setLoading(false)
      return
    }

    try {
      const result = await createPet(formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/pets')
      }
    } catch (err) {
      setError('Erro ao criar pet')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              🐕
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Novo Pet
              </h1>
              <p className="text-purple-200/60">Cadastre um novo pet no sistema</p>
            </div>
          </div>
        </div>

        {error && (
          <GlassCard variant="default" className="p-4 mb-6 bg-red-500/20 border-red-500/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        )}

        <GlassCard variant="default" className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Client */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
              <Select
                id="clientId"
                label={
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">👤</span>
                    Dono *
                  </span>
                }
                value={formData.clientId}
                onChange={(value) => handleChange('clientId', value)}
                placeholder="Selecione o dono"
                options={[
                  { value: '', label: 'Selecione o dono' },
                  ...clients.map((client) => ({ value: client.id, label: client.name }))
                ]}
                required
              />
              {clients.length === 0 && (
                <p className="text-purple-200/50 text-xs mt-2 ml-8">
                  <Link href="/app/clientes/novo" className="text-purple-400 hover:underline">
                    Crie um cliente primeiro
                  </Link>
                </p>
              )}
            </div>

            {/* Name */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
              <label htmlFor="name" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐾</span>
                Nome do Pet *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Rex, Mimi, Bob..."
                required
                className="w-full"
              />
            </div>

            {/* Breed */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
              <label htmlFor="breed" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐕‍🦺</span>
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
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
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
                        ? 'bg-purple-500/30 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{size.emoji}</div>
                    <div className="text-sm font-medium">{size.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
              <label htmlFor="notes" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📝</span>
                Observações
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Adicione observações sobre o pet..."
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '400ms' }}>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || clients.length === 0}
                className="flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Pet'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </main>
    </div>
  )
}
