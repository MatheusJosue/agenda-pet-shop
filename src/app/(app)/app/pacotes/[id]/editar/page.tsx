'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { updatePackageType, getPackageTypeById } from '@/lib/actions/packages'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AppHeader } from '@/components/layout/app-header'
import { AppLayout } from '@/components/layout/app-layout'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { ArrowLeft } from 'lucide-react'
import type { PackageType } from '@/lib/types/packages'

export default function EditarTipoPacotePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageType, setPackageType] = useState<PackageType | null>(null)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    interval_days: '7',
    credits: '',
    price: '',
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
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadPackageType() {
      try {
        const result = await getPackageTypeById(id)
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setPackageType(result.data)
          setFormData({
            name: result.data.name,
            interval_days: result.data.interval_days.toString(),
            credits: result.data.credits.toString(),
            price: result.data.price.toString(),
          })
        }
      } catch (err) {
        setError('Erro ao carregar tipo de pacote')
      } finally {
        setLoading(false)
      }
    }
    loadPackageType()
  }, [id])

  // Auto-fill credits based on interval
  useEffect(() => {
    const creditsMap: Record<string, string> = {
      '7': '4',    // Semanal
      '15': '2',   // Quinzenal
      '30': '1',   // Mensal
    }
    setFormData(prev => ({
      ...prev,
      credits: creditsMap[prev.interval_days] || '4',
    }))
  }, [formData.interval_days])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await updatePackageType(id, {
        name: formData.name,
        interval_days: parseInt(formData.interval_days) as 7 | 15 | 30,
        credits: parseInt(formData.credits),
        price: parseFloat(formData.price),
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/pacotes')
      }
    } catch (err) {
      setError('Erro ao atualizar tipo de pacote')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
        <div className="min-h-screen xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:pb-0 pb-20">
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <BottomNavigation />
        </div>
      </AppLayout>
    )
  }

  if (error && !packageType) {
    return (
      <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
        <div className="min-h-screen xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:pb-0 pb-20">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <GlassCard variant="default" className="p-8 bg-red-500/20 border-red-500/50">
              <p className="text-red-200">⚠️ {error}</p>
              <Link href="/app/pacotes">
                <Button variant="secondary" size="md" className="mt-4">
                  Voltar
                </Button>
              </Link>
            </GlassCard>
          </main>
          <BottomNavigation />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="min-h-screen xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:pb-0 pb-20">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
          title="Editar Tipo de Pacote"
          subtitle="Altere as informações do tipo de pacote"
          icon="✏️"
          action={
            <Link href="/app/pacotes">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft size={20} />
              </Button>
            </Link>
          }
        />

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
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
                  Nome do Tipo de Pacote *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Pacote Semanal, Pacote Quinzenal..."
                  required
                  className="w-full"
                />
              </div>

              {/* Interval Days */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <label htmlFor="interval_days" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">📅</span>
                  Intervalo de Dias *
                </label>
                <Select
                  id="interval_days"
                  value={formData.interval_days}
                  onChange={(value) => handleChange('interval_days', value)}
                  options={[
                    { value: '7', label: '7 dias (Semanal)' },
                    { value: '15', label: '15 dias (Quinzenal)' },
                    { value: '30', label: '30 dias (Mensal)' },
                  ]}
                  required
                  className="w-full"
                />
              </div>

              {/* Credits */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                <label htmlFor="credits" className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">💎</span>
                  Créditos *
                </label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  value={formData.credits}
                  onChange={(e) => handleChange('credits', e.target.value)}
                  placeholder="Ex: 4"
                  required
                  disabled
                  className="w-full opacity-70 cursor-not-allowed"
                />
              </div>

              {/* Price */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '350ms' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => router.back()}
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
          </GlassCard>
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}
