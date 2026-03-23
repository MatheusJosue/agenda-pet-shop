'use client'

import { useState } from 'react'
import { Search, Eye, Ban, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface CompaniesTableProps {
  companies: CompanyWithMetrics[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (id: string, active: boolean) => {
    setToggling(id)
    try {
      const result = await toggleCompanyStatus(id, !active)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Empresa ${active ? 'desativada' : 'reativada'} com sucesso`)
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-purple-200 font-medium">Nome</th>
              <th className="text-left p-4 text-purple-200 font-medium">Email</th>
              <th className="text-left p-4 text-purple-200 font-medium">Status</th>
              <th className="text-left p-4 text-purple-200 font-medium">Criado em</th>
              <th className="text-right p-4 text-purple-200 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr key={company.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <a href={`/admin/empresas/${company.id}`} className="text-white font-medium hover:text-purple-300">
                    {company.name}
                  </a>
                </td>
                <td className="p-4 text-gray-300">{company.email}</td>
                <td className="p-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    company.active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  )}>
                    {company.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="p-4 text-gray-300">
                  {format(new Date(company.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/admin/empresas/${company.id}`}
                      className="p-2 rounded-lg hover:bg-purple-500/20 text-purple-300"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </a>
                    <button
                      onClick={() => handleToggleStatus(company.id, company.active)}
                      disabled={toggling === company.id}
                      className={cn(
                        'p-2 rounded-lg hover:bg-opacity-20 disabled:opacity-50',
                        company.active
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      )}
                      title={company.active ? 'Desativar' : 'Reativar'}
                    >
                      {toggling === company.id ? null : company.active ? <Ban size={18} /> : <Check size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhuma empresa encontrada
          </div>
        )}
      </div>
    </div>
  )
}
