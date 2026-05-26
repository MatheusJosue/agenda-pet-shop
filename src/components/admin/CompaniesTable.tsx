'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Ban, Check, Eye, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
      setConfirmBlock({ id, name })
      return
    }

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

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
          <MoreHorizontal size={22} />
        </div>
        <p className="text-sm font-extrabold text-[#21363a]">Nenhuma empresa encontrada</p>
        <p className="mt-1 text-xs font-semibold text-[#68797d]">
          Ajuste a busca para visualizar outras contas.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            toggling={toggling === company.id}
            onToggle={() => handleToggleStatus(company.id, company.active, company.name)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-[rgba(232,50,123,0.16)]">
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Empresa</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Email</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Status</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Criado em</th>
              <th className="p-4 text-right text-xs font-extrabold uppercase text-[#006c73]">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-[rgba(232,50,123,0.10)] transition-colors hover:bg-white/58"
              >
                <td className="p-4">
                  <Link
                    href={`/admin/empresas/${company.id}`}
                    className="font-extrabold text-[#21363a] transition-colors hover:text-[#bf185d]"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="p-4 text-sm font-semibold text-[#68797d]">{company.email}</td>
                <td className="p-4">
                  <CompanyStatus active={company.active} />
                </td>
                <td className="p-4 text-sm font-semibold text-[#68797d]">
                  {format(new Date(company.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/empresas/${company.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#006c73] transition-colors hover:bg-[#dff7f4]"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(company.id, company.active, company.name)}
                      disabled={toggling === company.id}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-50',
                        company.active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
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
      </div>

      <ConfirmDialog
        open={!!confirmBlock}
        onOpenChange={(open) => !open && setConfirmBlock(null)}
        onConfirm={confirmDeactivation}
        title="Desativar empresa?"
        description={confirmBlock ? `Tem certeza que deseja desativar ${confirmBlock.name}? A empresa nao podera mais acessar o sistema.` : ''}
        confirmText="Desativar"
        cancelText="Cancelar"
        variant="danger"
        icon="alert"
        loading={toggling === confirmBlock?.id}
      />
    </>
  )
}

function CompanyCard({
  company,
  toggling,
  onToggle,
}: {
  company: CompanyWithMetrics
  toggling: boolean
  onToggle: () => void
}) {
  return (
    <article className="rounded-2xl border border-[rgba(232,50,123,0.16)] bg-white/68 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/empresas/${company.id}`}
            className="block truncate text-base font-extrabold text-[#21363a]"
          >
            {company.name}
          </Link>
          <p className="mt-1 truncate text-sm font-semibold text-[#68797d]">
            {company.email}
          </p>
        </div>
        <CompanyStatus active={company.active} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#68797d]">
          Criada em {format(new Date(company.created_at), 'dd/MM/yyyy', { locale: ptBR })}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/empresas/${company.id}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff7f4] text-[#006c73]"
            aria-label="Ver detalhes"
          >
            <Eye size={18} />
          </Link>
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-50',
              company.active
                ? 'bg-red-50 text-red-700'
                : 'bg-emerald-50 text-emerald-700',
            )}
            aria-label={company.active ? 'Desativar empresa' : 'Reativar empresa'}
          >
            {toggling ? null : company.active ? <Ban size={18} /> : <Check size={18} />}
          </button>
        </div>
      </div>
    </article>
  )
}

function CompanyStatus({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-extrabold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
      )}
    >
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}
