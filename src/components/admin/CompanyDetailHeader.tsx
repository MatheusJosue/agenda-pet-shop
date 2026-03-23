'use client'

import { useState } from 'react'
import { Edit2, X, Ban, Check } from 'lucide-react'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { updateCompany, toggleCompanyStatus } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface CompanyDetailHeaderProps {
  company: CompanyWithMetrics
}

export function CompanyDetailHeader({ company }: CompanyDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await updateCompany(company.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Empresa atualizada com sucesso')
      setIsEditing(false)
    }
  }

  async function handleToggleStatus() {
    setToggling(true)
    try {
      const result = await toggleCompanyStatus(company.id, !company.active)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Empresa ${company.active ? 'desativada' : 'reativada'} com sucesso`)
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="mb-8">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Nome</label>
              <input
                name="name"
                defaultValue={company.name}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-purple-200 text-sm mb-2">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={company.email}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
            <p className="text-purple-200/60">{company.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-4 py-2 rounded-full text-sm font-medium',
              company.active
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gray-500/20 text-gray-300'
            )}>
              {company.active ? 'Ativa' : 'Inativa'}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              title="Editar"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={cn(
                'p-2 rounded-lg disabled:opacity-50',
                company.active
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              )}
              title={company.active ? 'Desativar' : 'Reativar'}
            >
              {toggling ? null : company.active ? <Ban size={20} /> : <Check size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
