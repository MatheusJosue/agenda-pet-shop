'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAppointment } from '@/lib/actions/appointments'
import { getClients } from '@/lib/actions/clients'
import { getPets } from '@/lib/actions/pets'
import { getServices, getServicePrice } from '@/lib/actions/services'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Client } from '@/lib/types/clients'
import type { PetWithClient } from '@/lib/types/pets'
import type { Service } from '@/lib/types/services'

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

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<PetWithClient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredPets, setFilteredPets] = useState<PetWithClient[]>([])
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    petId: '',
    serviceId: '',
    date: '',
    time: '',
    price: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.clientId) {
      loadPets(formData.clientId)
    } else {
      setFilteredPets([])
      setFormData(prev => ({ ...prev, petId: '' }))
    }
  }, [formData.clientId])

  useEffect(() => {
    if (formData.petId && formData.serviceId) {
      loadSuggestedPrice()
    } else {
      setSuggestedPrice(null)
    }
  }, [formData.petId, formData.serviceId])

  const loadData = async () => {
    const [clientsResult, servicesResult] = await Promise.all([
      getClients(),
      getServices()
    ])
    if (clientsResult.data) setClients(clientsResult.data)
    if (servicesResult.data) setServices(servicesResult.data)
  }

  const loadPets = async (clientId: string) => {
    const result = await getPets(clientId)
    if (result.data) {
      setFilteredPets(result.data)
      setPets(result.data)
    }
  }

  const loadSuggestedPrice = async () => {
    const pet = pets.find(p => p.id === formData.petId)
    if (!pet) return

    const result = await getServicePrice(formData.serviceId, pet.size)
    if (result.data) {
      const price = result.data
      setSuggestedPrice(price)
      setFormData(prev => ({ ...prev, price: price.toString() }))
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.clientId || !formData.petId || !formData.serviceId) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      const result = await createAppointment({
        clientId: formData.clientId,
        petId: formData.petId,
        serviceId: formData.serviceId,
        date: new Date(formData.date),
        time: formData.time,
        price: parseFloat(formData.price),
        notes: formData.notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/agendamentos')
      }
    } catch (err) {
      setError('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
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
            href="/app/agendamentos"
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              ←
            </span>
            <span className="font-medium">Voltar para Agendamentos</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Title Section with Icon */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              🐾
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Novo Agendamento
              </h1>
              <p className="text-purple-200/60">Agende um novo serviço para seu pet</p>
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
                    Cliente
                  </span>
                }
                value={formData.clientId}
                onChange={(value) => handleChange('clientId', value)}
                placeholder="Selecione o cliente"
                options={[
                  { value: '', label: 'Selecione o cliente' },
                  ...clients.map((client) => ({ value: client.id, label: client.name }))
                ]}
                required
              />
            </div>

            {/* Pet */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
              <Select
                id="petId"
                label={
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐕</span>
                    Pet
                  </span>
                }
                value={formData.petId}
                onChange={(value) => handleChange('petId', value)}
                placeholder="Selecione o pet"
                disabled={!formData.clientId}
                options={[
                  { value: '', label: 'Selecione o pet' },
                  ...filteredPets.map((pet) => ({
                    value: pet.id,
                    label: `${sizeEmojis[pet.size]} ${pet.name} (${sizeLabels[pet.size]})`
                  }))
                ]}
                required
              />
            </div>

            {/* Service */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
              <Select
                id="serviceId"
                label={
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✨</span>
                    Serviço
                  </span>
                }
                value={formData.serviceId}
                onChange={(value) => handleChange('serviceId', value)}
                placeholder="Selecione o serviço"
                options={[
                  { value: '', label: 'Selecione o serviço' },
                  ...services.map((service) => ({ value: service.id, label: service.name }))
                ]}
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
              <div>
                <label htmlFor="date" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📅</span>
                  Data *
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={getMinDate()}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🕐</span>
                  Horário *
                </label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Price */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
              <label htmlFor="price" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💰</span>
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 font-medium">R$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-12"
                />
                {suggestedPrice !== null && formData.price !== suggestedPrice.toString() && (
                  <button
                    type="button"
                    onClick={() => handleChange('price', suggestedPrice.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    Usar R$ {suggestedPrice.toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '400ms' }}>
              <label htmlFor="notes" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📝</span>
                Observações
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Adicione observações sobre o agendamento..."
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '450ms' }}>
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
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Salvando...' : 'Criar Agendamento'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </main>
    </div>
  )
}
