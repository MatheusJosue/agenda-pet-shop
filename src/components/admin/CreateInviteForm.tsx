'use client'

import { useState } from 'react'
import { Ticket, Plus } from 'lucide-react'
import { createInvite } from '@/lib/actions/invites'
import { getAllCompanies } from '@/lib/actions/admin'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

interface CreateInviteFormProps {
  companies: CompanyWithMetrics[]
}

export function CreateInviteForm({ companies: initialCompanies }: CreateInviteFormProps) {
  const [createNewCompany, setCreateNewCompany] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('createNewCompany', createNewCompany.toString())

    const result = await createInvite(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Convite criado: ${result.data?.code}`)
      e.currentTarget.reset()
      setCreateNewCompany(false)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Ticket size={20} />
        Criar Novo Convite
      </h3>

      {/* Create new company toggle */}
      <div className="flex items-center gap-3">
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
        <>
          <div>
            <label className="block text-purple-200 text-sm mb-2">Nome da Empresa *</label>
            <input
              name="newCompanyName"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <label className="block text-purple-200 text-sm mb-2">Email da Empresa *</label>
            <input
              name="newCompanyEmail"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="email@empresa.com"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-purple-200 text-sm mb-2">Empresa *</label>
          <select
            name="companyId"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecione uma empresa</option>
            {initialCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-purple-200 text-sm mb-2">Role *</label>
        <select
          name="role"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="company_admin">Company Admin</option>
          <option value="company_user">Company User</option>
        </select>
      </div>

      <div>
        <label className="block text-purple-200 text-sm mb-2">Expira em (dias) *</label>
        <input
          name="expiresInDays"
          type="number"
          min="1"
          max="365"
          defaultValue={365}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus size={20} />
        {loading ? 'Criando...' : 'Gerar Convite'}
      </button>
    </form>
  )
}
