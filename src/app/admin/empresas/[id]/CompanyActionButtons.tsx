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
          className={cn(
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all',
            company.active
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
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
