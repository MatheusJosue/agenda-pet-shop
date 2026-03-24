'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Plus, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { createInvite } from '@/lib/actions/invites'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toast } from 'react-toastify'

interface CreateInviteModalProps {
  companies: CompanyWithMetrics[]
  onClose: () => void
}

export function CreateInviteModal({ companies, onClose }: CreateInviteModalProps) {
  const router = useRouter()
  const [createNewCompany, setCreateNewCompany] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyId: '',
    newCompanyName: '',
    newCompanyEmail: '',
    role: 'company_admin',
    expiresInDays: '365'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    if (createNewCompany) {
      data.append('newCompanyName', formData.newCompanyName)
      data.append('newCompanyEmail', formData.newCompanyEmail)
    } else {
      data.append('companyId', formData.companyId)
    }
    data.append('role', formData.role)
    data.append('expiresInDays', formData.expiresInDays)
    data.append('createNewCompany', createNewCompany.toString())

    const result = await createInvite(data)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Convite criado: ${result.data?.code}`)
      onClose()
      router.refresh()
    }
  }

  const roleOptions = [
    { value: 'company_admin', label: 'Company Admin' },
    { value: 'company_user', label: 'Company User' }
  ]

  const companyOptions = companies.map(c => ({
    value: c.id,
    label: `${c.name} (${c.email})`
  }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket size={20} className="text-purple-400" />
            Novo Convite
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Create new company toggle */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={createNewCompany}
                onChange={(e) => setCreateNewCompany(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-300">Criar nova empresa</span>
            </label>
          </div>

          {createNewCompany ? (
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">Nome da Empresa *</label>
                <input
                  value={formData.newCompanyName}
                  onChange={(e) => setFormData({ ...formData, newCompanyName: e.target.value })}
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Ex: Pet Shop Central"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">Email da Empresa *</label>
                <input
                  value={formData.newCompanyEmail}
                  onChange={(e) => setFormData({ ...formData, newCompanyEmail: e.target.value })}
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>
          ) : (
            <Select
              label="Empresa"
              options={companyOptions}
              value={formData.companyId}
              onChange={(value) => setFormData({ ...formData, companyId: value })}
              placeholder="Selecione uma empresa"
              required
            />
          )}

          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            required
          />
          <p className="text-xs text-purple-200/50 -mt-3">
            {formData.role === 'company_admin'
              ? 'Pode gerenciar a empresa e ver relatórios'
              : 'Pode apenas visualizar e agendar'}
          </p>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">Expira em (dias) *</label>
            <input
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
              type="number"
              min="1"
              max="365"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            <p className="text-xs text-purple-200/50 mt-1.5">
              O convite expira em {formData.expiresInDays} dias a partir de hoje
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              {loading ? 'Criando...' : 'Gerar Convite'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
