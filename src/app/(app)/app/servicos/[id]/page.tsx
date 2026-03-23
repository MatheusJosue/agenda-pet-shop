'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getServiceById, updateService, deleteService, checkServiceAppointments } from '@/lib/actions/services'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2 } from 'lucide-react'
import type { Service } from '@/lib/types/services'

export default function ServicoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    price_small: '',
    price_medium: '',
    price_large: '',
    duration_minutes: '60',
  })

  useEffect(() => {
    loadService()
    loadAppointmentCount()
  }, [serviceId])

  const loadService = async () => {
    setLoading(true)
    const result = await getServiceById(serviceId)

    if (result.error || !result.data) {
      setError(result.error || 'Serviço não encontrado')
    } else {
      setService(result.data)
      setFormData({
        name: result.data.name,
        price_small: result.data.price_small.toString(),
        price_medium: result.data.price_medium.toString(),
        price_large: result.data.price_large.toString(),
        duration_minutes: result.data.duration_minutes.toString(),
      })
    }
    setLoading(false)
  }

  const loadAppointmentCount = async () => {
    const count = await checkServiceAppointments(serviceId)
    setAppointmentCount(count)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await updateService(serviceId, {
        name: formData.name,
        price_small: parseFloat(formData.price_small),
        price_medium: parseFloat(formData.price_medium),
        price_large: parseFloat(formData.price_large),
        duration_minutes: parseInt(formData.duration_minutes),
      })

      if (result.error) {
        setError(result.error)
      } else {
        setService(result.data || null)
        setEditing(false)
      }
    } catch (err) {
      setError('Erro ao atualizar serviço')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (appointmentCount > 0) {
      setError(`Não é possível excluir serviço com ${appointmentCount} agendamento(s) futuro(s)`)
      return
    }

    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const result = await deleteService(serviceId)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/servicos')
      }
    } catch (err) {
      setError('Erro ao excluir serviço')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!service || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <GlassCard variant="default" className="p-8 text-center">
            <p className="text-red-400 mb-4">{error || 'Serviço não encontrado'}</p>
            <Link href="/app/servicos">
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
            href="/app/servicos"
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              ←
            </span>
            <span className="font-medium">Voltar para Serviços</span>
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
                ✂️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  {service.name}
                </h1>
                <p className="text-purple-200/60">
                  {editing ? 'Editando' : 'Detalhes'} do serviço
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
                        name: service.name,
                        price_small: service.price_small.toString(),
                        price_medium: service.price_medium.toString(),
                        price_large: service.price_large.toString(),
                        duration_minutes: service.duration_minutes.toString(),
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
                    onClick={() => setEditing(true)}
                    disabled={saving}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleDelete}
                    disabled={saving || appointmentCount > 0}
                    title={appointmentCount > 0 ? `${appointmentCount} agendamento(s) futuro(s)` : undefined}
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

        <GlassCard variant="default" className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-7">
              {/* Name */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                <label htmlFor="name" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✂️</span>
                  Nome do Serviço *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Prices */}
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <h3 className="text-purple-100/90 text-sm font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💰</span>
                  Preços *
                </h3>

                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                  <label htmlFor="price_small" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐱</span>
                    Porte Pequeno
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 font-medium">R$</span>
                    <Input
                      id="price_small"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_small}
                      onChange={(e) => handleChange('price_small', e.target.value)}
                      required
                      className="w-full pl-12"
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                  <label htmlFor="price_medium" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐕</span>
                    Porte Médio
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 font-medium">R$</span>
                    <Input
                      id="price_medium"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_medium}
                      onChange={(e) => handleChange('price_medium', e.target.value)}
                      required
                      className="w-full pl-12"
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
                  <label htmlFor="price_large" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🦮</span>
                    Porte Grande
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 font-medium">R$</span>
                    <Input
                      id="price_large"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_large}
                      onChange={(e) => handleChange('price_large', e.target.value)}
                      required
                      className="w-full pl-12"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '400ms' }}>
                <label htmlFor="duration_minutes" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">⏱️</span>
                  Duração (minutos)
                </label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => handleChange('duration_minutes', e.target.value)}
                  className="w-full"
                />
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✂️</span>
                  Nome
                </h2>
                <p className="text-2xl font-semibold text-white">{service.name}</p>
              </div>

              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💰</span>
                  Preços
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐱</span>
                      Porte Pequeno
                    </span>
                    <span className="text-white font-semibold">
                      R$ {service.price_small.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🐕</span>
                      Porte Médio
                    </span>
                    <span className="text-white font-semibold">
                      R$ {service.price_medium.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🦮</span>
                      Porte Grande
                    </span>
                    <span className="text-white font-semibold">
                      R$ {service.price_large.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">⏱️</span>
                  Duração
                </h2>
                <p className="text-white">{service.duration_minutes} minutos</p>
              </div>

              <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                <p className="text-purple-200/40 text-xs">
                  Cadastrado em {new Date(service.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  )
}
