'use client'

import { useState } from 'react'
import { Ban, Check } from 'lucide-react'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CompanyActionButtonsProps {
  company: CompanyWithMetrics
}

export function CompanyActionButtons({ company }: CompanyActionButtonsProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleToggleStatus = async () => {
    if (company.active) {
      setShowConfirm(true)
      return
    }

    setToggling(true)
    try {
      const result = await toggleCompanyStatus(company.id, true)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa reativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(false)
    }
  }

  const confirmDeactivation = async () => {
    setToggling(true)
    try {
      const result = await toggleCompanyStatus(company.id, false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa desativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition-all sm:w-auto',
            company.active
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          )}
          onClick={handleToggleStatus}
          disabled={toggling}
        >
          {toggling ? (
            'Processando...'
          ) : company.active ? (
            <>
              <Ban size={18} />
              Desativar
            </>
          ) : (
            <>
              <Check size={18} />
              Reativar
            </>
          )}
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={confirmDeactivation}
        title="Desativar empresa?"
        description={`Você tem certeza que deseja desativar ${company.name}? A empresa não poderá mais acessar o sistema.`}
        confirmText="Desativar"
        cancelText="Cancelar"
        variant="danger"
        icon="alert"
        loading={toggling}
      />
    </>
  )
}
