'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { getClientById, updateClient, deleteClient } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2 } from 'lucide-react'
import { formatPhone } from '@/lib/utils/phone'
import { ClientPetsSection } from './_components/ClientPetsSection'
import type { Client } from '@/lib/types/clients'

export default function ClienteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    setLoading(true)
    const result = await getClientById(clientId)

    if (result.error || !result.data) {
      setError(result.error || 'Cliente não encontrado')
    } else {
      setClient(result.data)
      setFormData({
        name: result.data.name,
        phone: formatPhone(result.data.phone),
        email: result.data.email || '',
        notes: result.data.notes || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await updateClient(clientId, formData)

      if (result.error) {
        setError(result.error)
      } else {
        setClient(result.data || null)
        setEditing(false)
      }
    } catch (err) {
      setError('Erro ao atualizar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Excluir cliente?',
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

    if (!result.isConfirmed) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const deleteResult = await deleteClient(clientId)

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
          text: 'O cliente foi excluído com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)',
          color: '#fff',
          confirmButtonColor: '#a855f7',
        })
        router.push('/app/clientes')
      }
    } catch (err) {
      setError('Erro ao excluir cliente')
      await Swal.fire({
        title: 'Erro!',
        text: 'Erro ao excluir cliente',
        icon: 'error',
        confirmButtonText: 'OK',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      })
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <p className="text-purple-200/60">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!client || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <GlassCard variant="default" className="p-8 text-center">
            <p className="text-red-400 mb-4">{error || 'Cliente não encontrado'}</p>
            <Link href="/app/clientes">
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
            href="/app/clientes"
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              ←
            </span>
            <span className="font-medium">Voltar para Clientes</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Title Section with Icon */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Cliente
              </h1>
              <p className="text-purple-200/60">{editing ? 'Editando' : 'Detalhes'} do cliente</p>
            </div>
          </div>
        </div>

        {error && (
          <GlassCard variant="default" className="p-4 mb-6 bg-red-500/20 border-red-500/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        )}

        <GlassCard variant="default" className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 relative">
          {!editing && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={saving}
                className="h-8 w-8 p-0 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="h-8 w-8 p-0 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-7">
              {/* Name */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                <label htmlFor="name" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">👤</span>
                  Nome *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  minLength={3}
                  className="w-full"
                  placeholder="Nome do cliente"
                />
              </div>

              {/* Phone */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <label htmlFor="phone" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📱</span>
                  Telefone *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="w-full"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Email */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                <label htmlFor="email" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✉️</span>
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full"
                  placeholder="email@exemplo.com"
                />
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
                  rows={3}
                  placeholder="Adicione observações sobre o cliente..."
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
                      name: client.name,
                      phone: formatPhone(client.phone),
                      email: client.email || '',
                      notes: client.notes || '',
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
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">👤</span>
                  Nome
                </h2>
                <p className="text-xl font-semibold text-white">{client.name}</p>
              </div>

              {client.phone && (
                <div>
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📱</span>
                    Telefone
                  </h2>
                  <p className="text-white">{formatPhone(client.phone)}</p>
                </div>
              )}

              {client.email && (
                <div>
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">✉️</span>
                    Email
                  </h2>
                  <p className="text-white">{client.email}</p>
                </div>
              )}

              {client.notes && (
                <div>
                  <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📝</span>
                    Observações
                  </h2>
                  <p className="text-white whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className="text-purple-200/40 text-xs">
                  Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Pets Section */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <ClientPetsSection clientId={clientId} />
        </div>
      </main>
    </div>
  )
}
