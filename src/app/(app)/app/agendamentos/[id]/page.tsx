'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { getAppointmentById, updateAppointment, updateAppointmentStatus, deleteAppointment } from '@/lib/actions/appointments'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AppointmentWithRelations } from '@/lib/types/appointments'

const statusLabels = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado'
}

const statusStyles = {
  scheduled: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-200 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-200 border-red-500/30'
}

const sizeEmojis = {
  small: '🐱',
  medium: '🐕',
  large: '🦮'
}

const sizeLabels = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AgendamentoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    price: '',
    notes: '',
  })

  useEffect(() => {
    loadAppointment()
  }, [appointmentId])

  const loadAppointment = async () => {
    setLoading(true)
    const result = await getAppointmentById(appointmentId)

    if (result.error || !result.data) {
      setError(result.error || 'Agendamento não encontrado')
    } else {
      setAppointment(result.data)
      setFormData({
        date: result.data.date,
        time: result.data.time,
        price: result.data.price.toString(),
        notes: result.data.notes || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await updateAppointment(appointmentId, {
        date: formData.date,
        time: formData.time,
        price: parseFloat(formData.price),
        notes: formData.notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        await loadAppointment()
        setEditing(false)
      }
    } catch (err) {
      setError('Erro ao atualizar agendamento')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (status: 'scheduled' | 'completed' | 'cancelled') => {
    setSaving(true)
    setError(null)

    try {
      const result = await updateAppointmentStatus(appointmentId, status)

      if (result.error) {
        setError(result.error)
      } else {
        await loadAppointment()
      }
    } catch (err) {
      setError('Erro ao atualizar status')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const result = await deleteAppointment(appointmentId)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/agendamentos')
      }
    } catch (err) {
      setError('Erro ao excluir agendamento')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
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
          <p className="text-purple-200/60">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!appointment || error) {
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
            <p className="text-red-200 mb-4">⚠️ {error || 'Agendamento não encontrado'}</p>
            <Link href="/app/agendamentos">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[appointment.status]}`}>
                {statusLabels[appointment.status]}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              {formatDate(appointment.date)} • {appointment.time}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={saving || appointment.status !== 'scheduled' || editing}
              className="rounded-lg"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={saving || appointment.status !== 'scheduled' || editing}
              className="rounded-lg"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {error && (
          <GlassCard variant="default" className="p-3 mb-4 bg-red-500/20 border-red-500/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-200 text-sm">⚠️ {error}</p>
          </GlassCard>
        )}

        {/* Status Actions */}
        {appointment.status === 'scheduled' && !editing && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleStatusChange('completed')}
              disabled={saving}
              className="w-full"
            >
              ✓ Concluído
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleStatusChange('cancelled')}
              disabled={saving}
              className="w-full"
            >
              ✕ Cancelar
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pet Card */}
          <GlassCard variant="default" className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                {sizeEmojis[appointment.pet.size]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-200/50 text-xs mb-1">Pet</p>
                <Link
                  href={`/app/pets/${appointment.pet.id}`}
                  className="text-white font-semibold text-lg hover:text-purple-300 transition-colors"
                >
                  {appointment.pet.name}
                </Link>
                <p className="text-purple-200/60 text-sm">{sizeLabels[appointment.pet.size]}</p>
              </div>
            </div>
          </GlassCard>

          {/* Client Card */}
          <GlassCard variant="default" className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-200/50 text-xs mb-1">Cliente</p>
                <Link
                  href={`/app/clientes/${appointment.client.id}`}
                  className="text-white font-semibold text-lg hover:text-purple-300 transition-colors"
                >
                  {appointment.client.name}
                </Link>
                <p className="text-purple-200/60 text-sm">{appointment.client.phone}</p>
              </div>
            </div>
          </GlassCard>

          {/* Service Card */}
          <GlassCard variant="default" className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                ✂️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-200/50 text-xs mb-1">Serviço</p>
                <p className="text-white font-semibold text-lg">{appointment.service.name}</p>
                <p className="text-purple-200/60 text-sm">{appointment.service.duration_minutes} min</p>
              </div>
            </div>
          </GlassCard>

          {/* Price Card */}
          <GlassCard variant="default" className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                💰
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-200/50 text-xs mb-1">Valor</p>
                <p className="text-white font-bold text-2xl">R$ {appointment.price.toFixed(2)}</p>
                {appointment.used_credit && (
                  <p className="text-purple-200/60 text-sm">Crédito utilizado</p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Notes Section */}
        {appointment.notes && (
          <GlassCard variant="default" className="p-5 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <p className="text-purple-200/50 text-xs mb-2 flex items-center gap-2">
              <span>📝</span>
              Observações
            </p>
            <p className="text-white leading-relaxed">{appointment.notes}</p>
          </GlassCard>
        )}

        {/* Edit Form */}
        {editing && (
          <GlassCard variant="default" className="p-5 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-purple-200/70 text-sm font-medium mb-2">
                    Data
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
                  <label htmlFor="time" className="block text-purple-200/70 text-sm font-medium mb-2">
                    Horário
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
              <div>
                <label htmlFor="price" className="block text-purple-200/70 text-sm font-medium mb-2">
                  Preço
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50">R$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                    className="w-full pl-12"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="block text-purple-200/70 text-sm font-medium mb-2">
                  Observações
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Adicione observações..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      date: appointment.date,
                      time: appointment.time,
                      price: appointment.price.toString(),
                      notes: appointment.notes || '',
                    })
                    setError(null)
                  }}
                  disabled={saving}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Footer */}
        <p className="text-center text-purple-200/20 text-xs mt-6">
          Criado em {new Date(appointment.created_at).toLocaleDateString('pt-BR')} às {new Date(appointment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </main>
    </div>
  )
}
