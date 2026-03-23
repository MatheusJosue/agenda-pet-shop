'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createService } from '@/lib/actions/services'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function NovoServicoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price_small: '',
    price_medium: '',
    price_large: '',
    duration_minutes: '60',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createService({
        name: formData.name,
        price_small: parseFloat(formData.price_small),
        price_medium: parseFloat(formData.price_medium),
        price_large: parseFloat(formData.price_large),
        duration_minutes: parseInt(formData.duration_minutes),
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/servicos')
      }
    } catch (err) {
      setError('Erro ao criar serviço')
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              ✨
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Novo Serviço
              </h1>
              <p className="text-purple-200/60">Cadastre um novo serviço</p>
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
            {/* Name */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
              <label htmlFor="name" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📋</span>
                Nome do Serviço *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Banho e Tosa, Tosa Higiênica..."
                required
                className="w-full"
              />
            </div>

            {/* Prices */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
              <h3 className="text-purple-100/90 text-sm font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💰</span>
                Preços por Porte *
              </h3>

              <div>
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
                    placeholder="0.00"
                    required
                    className="w-full pl-12"
                  />
                </div>
              </div>

              <div>
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
                    placeholder="0.00"
                    required
                    className="w-full pl-12"
                  />
                </div>
              </div>

              <div>
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
                    placeholder="0.00"
                    required
                    className="w-full pl-12"
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
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
                placeholder="60"
                className="w-full"
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
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Serviço'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </main>
    </div>
  )
}
