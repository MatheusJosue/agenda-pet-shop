'use client'

import { useState } from 'react'
import { Eye, Ban, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface CompaniesTableProps {
  companies: CompanyWithMetrics[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState<string | null>(null)
  const [confirmBlock, setConfirmBlock] = useState<{ id: string; name: string } | null>(null)

  const handleToggleStatus = async (id: string, active: boolean, name: string) => {
    if (active) {
      // Show confirmation modal when deactivating
      setConfirmBlock({ id, name })
      return
    }

    // Directly activate
    setToggling(id)
    try {
      const result = await toggleCompanyStatus(id, true)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa reativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(null)
    }
  }

  const confirmDeactivation = async () => {
    if (!confirmBlock) return

    setToggling(confirmBlock.id)
    try {
      const result = await toggleCompanyStatus(confirmBlock.id, false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa desativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(null)
      setConfirmBlock(null)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Nome</th>
              <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Email</th>
              <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Criado em</th>
              <th className="text-right p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
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
                        onClick={() => handleToggleStatus(company.id, company.active, company.name)}
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
        {companies.length === 0 && (
          <div className="text-center py-12 text-purple-200/60">
            Nenhuma empresa encontrada
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmBlock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900/20 border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Ban size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Desativar empresa?</h3>
            <p className="text-purple-200/70 mb-6">
              Você tem certeza que deseja desativar <strong className="text-white">{confirmBlock.name}</strong>?
              A empresa não poderá mais acessar o sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBlock(null)}
                disabled={toggling === confirmBlock.id}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivation}
                disabled={toggling === confirmBlock.id}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {toggling === confirmBlock.id ? 'Desativando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
