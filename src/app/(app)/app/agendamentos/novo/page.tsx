'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAppointment } from '@/lib/actions/appointments'
import { getClients } from '@/lib/actions/clients'
import { getPets } from '@/lib/actions/pets'
import { getServices, getServicePrice } from '@/lib/actions/services'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { SetHeaderAction } from '@/components/layout/set-header-action'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import type { Client } from '@/lib/types/clients'
import type { Service } from '@/lib/types/services'

interface PetWithClient {
  id: string
  name: string
  size: 'small' | 'medium' | 'large'
}

interface SelectedService {
  serviceId: string
  price: number
}

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
  const [services, setServices] = useState<Service[]>([])
  const [filteredPets, setFilteredPets] = useState<PetWithClient[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    petId: '',
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
    if (formData.petId && selectedServices.length > 0) {
      calculateTotalPrice()
    } else {
      setFormData(prev => ({ ...prev, price: '' }))
    }
  }, [formData.petId, selectedServices])

  useEffect(() => {
    // Clear selected services when pet changes
    if (!formData.petId) {
      setSelectedServices([])
    }
  }, [formData.petId])

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
    }
  }

  const calculateTotalPrice = async () => {
    let total = 0
    for (const selected of selectedServices) {
      const result = await getServicePrice(selected.serviceId)
      if (result.data) {
        total += result.data
      }
    }

    setFormData(prev => ({ ...prev, price: total.toFixed(2) }))
  }

  const toggleService = async (serviceId: string) => {
    if (!formData.petId) return

    const existingIndex = selectedServices.findIndex(s => s.serviceId === serviceId)
    let newSelectedServices: SelectedService[]

    if (existingIndex >= 0) {
      // Remove service
      newSelectedServices = selectedServices.filter(s => s.serviceId !== serviceId)
    } else {
      // Add service with price
      const result = await getServicePrice(serviceId)
      const price = result.data || 0
      newSelectedServices = [...selectedServices, { serviceId, price }]
    }

    setSelectedServices(newSelectedServices)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.clientId || !formData.petId || selectedServices.length === 0) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      // Use the first selected service as the primary service
      const primaryServiceId = selectedServices[0].serviceId
      const totalPrice = parseFloat(formData.price)

      const result = await createAppointment({
        clientId: formData.clientId,
        petId: formData.petId,
        serviceId: primaryServiceId,
        date: new Date(formData.date),
        time: formData.time,
        price: totalPrice,
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
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      {/* Desktop header action */}
      <SetHeaderAction
        action={
          <Link href="/app/agendamentos">
            <Button variant="secondary" size="sm" className="rounded-full gap-1">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          </Link>
        }
      />

      <AppHeader
        companyName="Agenda Pet Shop"
        user={{}}
        title="Novo Agendamento"
        subtitle="Agende um novo serviço para seu pet"
        icon="🐾"
        action={
          <Link href="/app/agendamentos">
            <Button variant="secondary" size="sm" className="rounded-full gap-1">
              <ArrowLeft size={16} />
            </Button>
          </Link>
        }
      />

      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative flex flex-col xl:block overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto xl:overflow-auto">
          {/* Main Content */}
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
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

            {/* Services - Multi Select */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
              <label className="block text-purple-100/90 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✨</span>
                Serviços *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = selectedServices.some(s => s.serviceId === service.id)
                  return (
                    <button
                      key={service.id}
                      type="button"
                      disabled={!formData.petId}
                      onClick={() => toggleService(service.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${isSelected
                          ? 'bg-purple-500/30 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
                        }
                        ${!formData.petId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{service.name}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-xs">✓</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {!formData.petId && (
                <p className="mt-2 text-xs text-purple-200/50">Selecione um pet primeiro para ver os preços</p>
              )}
              {selectedServices.length > 0 && formData.petId && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedServices.map((selected) => {
                    const service = services.find(s => s.id === selected.serviceId)
                    return (
                      <span
                        key={selected.serviceId}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-sm"
                      >
                        {service?.name} - R$ {selected.price.toFixed(2)}
                      </span>
                    )
                  })}
                </div>
              )}
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

            {/* Price - Disabled, auto-calculated */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
              <label htmlFor="price" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💰</span>
                Preço Total *
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
                  disabled
                  required
                  className="w-full pl-12 disabled:opacity-70 disabled:cursor-not-allowed"
                />
                {selectedServices.length > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-300/70">
                    Calculado ({selectedServices.length} serviço{selectedServices.length > 1 ? 's' : ''})
                  </span>
                )}
              </div>
              {!formData.price && (
                <p className="mt-2 text-xs text-purple-200/50">O preço será calculado automaticamente com base nos serviços selecionados e porte do pet</p>
              )}
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

      <BottomNavigation />
      </div>
    </AppLayout>
  )
}
